// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IClearingTypes } from "../../facets/clearing/IClearingTypes.sol";
import { ERC1410StorageWrapper } from "./ERC1410StorageWrapper.sol";
import { ScheduledTasksStorageWrapper } from "./ScheduledTasksStorageWrapper.sol";
import { SnapshotsStorageWrapper } from "./SnapshotsStorageWrapper.sol";
import { ERC20StorageWrapper } from "./ERC20StorageWrapper.sol";
import { CapStorageWrapper } from "../core/CapStorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { IAdjustBalances } from "../../facets/adjustBalances/IAdjustBalances.sol";
import { MAX_UINT256, MAX_UINT8 } from "../../constants/values.sol";

/// @custom:hash storage AdjustBalances
bytes32 constant STORAGE_LOCATION_ADJUST_BALANCES = 0x155c219135942fbe253879a75d7b29fe22563c8a767fff8bfb3bf08229d5ac00;

/**
 * @notice Storage layout for the asset-wide balance-adjustment factor (ABAF) and the per-holder,
 *         per-partition and per-position last-adjusted balance-adjustment factors (LABAFs).
 * @dev Mirrors the ERC-7201 namespaced slot referenced by `STORAGE_LOCATION_ADJUST_BALANCES`.
 *      Each LABAF mapping records the value of `abaf` at the moment a particular balance
 *      (allowance, lock, hold, freeze, clearing) was last touched; future reads apply
 *      `abaf / labaf` to project the historical amount onto the current factor. New fields
 *      MUST be appended below the APPEND-ONLY marker to preserve slot stability for live
 *      proxies.
 * @custom:storage-location erc7201:security.token.standard.storage.AdjustBalances
 */
struct AdjustBalancesStorage {
    // ─── R1 Lifecycle (bool flags) ───────────────────────────
    // ─── R2 Packed scalars (uint8, bytes3, address, enum) ────
    // ─── R3 Single-slot scalars (uint256, bytes32, string) ───
    uint256 abaf;
    // ─── R4 Aggregates (mapping, array, EnumerableSet) ───────
    mapping(address => uint256[]) labafUserPartition;
    mapping(address => uint256) labaf;
    mapping(bytes32 => uint256) labafByPartition;
    mapping(address => mapping(address => uint256)) labafsAllowances;
    // Locks
    mapping(address => uint256) labafLockedAmountByAccount;
    mapping(address => mapping(bytes32 => uint256)) labafLockedAmountByAccountAndPartition;
    mapping(address => mapping(bytes32 => mapping(uint256 => uint256))) labafLockedAmountByAccountPartitionAndId;
    // Holds
    mapping(address => uint256) labafHeldAmountByAccount;
    mapping(address => mapping(bytes32 => uint256)) labafHeldAmountByAccountAndPartition;
    mapping(address => mapping(bytes32 => mapping(uint256 => uint256))) labafHeldAmountByAccountPartitionAndId;
    // Clearings
    mapping(address => uint256) labafClearedAmountByAccount;
    mapping(address => mapping(bytes32 => uint256)) labafClearedAmountByAccountAndPartition;
    // solhint-disable-next-line max-line-length
    mapping(address => mapping(bytes32 => mapping(IClearingTypes.ClearingOperationType => mapping(uint256 => uint256)))) labafClearedAmountByAccountPartitionTypeAndId;
    // Freezes
    mapping(address => uint256) labafFrozenAmountByAccount;
    mapping(address => mapping(bytes32 => uint256)) labafFrozenAmountByAccountAndPartition;
    // ─── APPEND-ONLY ZONE BELOW ───
}

/**
 * @title AdjustBalancesStorageWrapper
 * @author Asset Tokenization Studio Team
 * @notice Storage accessor and balance-adjustment helper library for the ABAF / LABAF system.
 * @dev Centralises reads, writes and factor arithmetic for the asset-wide balance adjustment
 *      factor (`abaf`) and every per-holder, per-partition and per-position LABAF stored under
 *      the ERC-7201 namespace `security.token.standard.storage.AdjustBalances`. Mutators are
 *      consumed by sibling storage wrappers (locks, holds, freezes, clearings) and by facets
 *      that schedule balance adjustments; getters apply `zeroToOne` so callers never multiply
 *      by an uninitialised zero.
 */
library AdjustBalancesStorageWrapper {
    /**
     * @notice Multiplies the asset-wide balance-adjustment factor (ABAF) by `factor`.
     * @dev Reads the current ABAF via `getAbaf` (which collapses an uninitialised zero to one)
     *      so the very first adjustment seeds the slot with `factor` instead of zero.
     * @param factor Multiplicative balance-adjustment factor to apply to ABAF.
     */
    function updateAbaf(uint256 factor) internal {
        _adjustBalancesStorage().abaf = getAbaf() * factor;
    }

    /**
     * @notice Records `labaf` as the last-adjusted factor for `tokenHolder`'s aggregate balance.
     * @dev Overwrites any previous value without checkpointing; callers MUST capture the prior
     *      value first if they need to project legacy balances forward.
     * @param labaf       Snapshot of `abaf` to anchor the holder's balance against.
     * @param tokenHolder Account whose LABAF entry is being refreshed.
     */
    function updateLabafByTokenHolder(uint256 labaf, address tokenHolder) internal {
        _adjustBalancesStorage().labaf[tokenHolder] = labaf;
    }

    /**
     * @notice Anchors a partition's LABAF to the current ABAF.
     * @dev Used after a partition-wide supply adjustment so subsequent factor projections
     *      compare against the freshly applied ABAF.
     * @param partition Partition identifier whose LABAF is refreshed.
     */
    function updateLabafByPartition(bytes32 partition) internal {
        _adjustBalancesStorage().labafByPartition[partition] = getAbaf();
    }

    /**
     * @notice Appends `_labaf` to the per-holder partition LABAF array.
     * @dev The array index aligns with `ERC1410StorageWrapper.partitionToIndex` minus one; callers
     *      MUST push exactly once per new partition assigned to the holder to keep indices in sync.
     * @param _tokenHolder Account whose partition LABAF array is being extended.
     * @param _labaf       LABAF value to record for the new partition slot.
     */
    function pushLabafUserPartition(address _tokenHolder, uint256 _labaf) internal {
        _adjustBalancesStorage().labafUserPartition[_tokenHolder].push(_labaf);
    }

    /**
     * @notice Removes the trailing LABAF entry from the per-holder partition array.
     * @dev Paired with ERC1410 partition removal so the array length tracks the holder's active
     *      partition count.
     * @param _tokenHolder Account whose partition LABAF array is being shortened.
     */
    function popLabafUserPartition(address _tokenHolder) internal {
        _adjustBalancesStorage().labafUserPartition[_tokenHolder].pop();
    }

    /**
     * @notice Overwrites the LABAF stored for `tokenHolder` at the given 1-based partition index.
     * @dev `partitionIndex` is the ERC1410 partition index as exposed by
     *      `partitionToIndex` (one-based); the storage array is zero-based hence the `- 1`.
     * @param labaf          LABAF value to store at the indexed slot.
     * @param tokenHolder    Account whose partition LABAF entry is being refreshed.
     * @param partitionIndex One-based partition index in the holder's partition list.
     */
    function updateLabafByTokenHolderAndPartitionIndex(
        uint256 labaf,
        address tokenHolder,
        uint256 partitionIndex
    ) internal {
        _adjustBalancesStorage().labafUserPartition[tokenHolder][partitionIndex - 1] = labaf;
    }

    /**
     * @notice Records the LABAF that anchors an ERC20 allowance from `_owner` to `_spender`.
     * @dev Allowances are scaled by `abaf / labaf` on consumption; setting the LABAF to the
     *      current ABAF freezes the allowance amount at its present nominal value.
     * @param _owner   Account that granted the allowance.
     * @param _spender Account permitted to spend on behalf of the owner.
     * @param _labaf   LABAF snapshot to anchor the allowance against.
     */
    function updateAllowanceLabaf(address _owner, address _spender, uint256 _labaf) internal {
        _adjustBalancesStorage().labafsAllowances[_owner][_spender] = _labaf;
    }

    /**
     * @notice Stores the LABAF for an individual lock identified by `_lockId`.
     * @dev Overwrites any prior value for the same `(_tokenHolder, _partition, _lockId)` triple.
     * @param _partition   Partition holding the locked balance.
     * @param _tokenHolder Owner of the locked balance.
     * @param _lockId      Identifier of the lock record.
     * @param _labaf       LABAF value to anchor the lock against.
     */
    function setLockLabafById(bytes32 _partition, address _tokenHolder, uint256 _lockId, uint256 _labaf) internal {
        _adjustBalancesStorage().labafLockedAmountByAccountPartitionAndId[_tokenHolder][_partition][_lockId] = _labaf;
    }

    /**
     * @notice Sets the LABAF anchoring `_tokenHolder`'s aggregate locked balance.
     * @param _tokenHolder Account whose total-lock LABAF is being refreshed.
     * @param _labaf       LABAF value to record.
     */
    function setTotalLockLabaf(address _tokenHolder, uint256 _labaf) internal {
        _adjustBalancesStorage().labafLockedAmountByAccount[_tokenHolder] = _labaf;
    }

    /**
     * @notice Sets the LABAF anchoring `_tokenHolder`'s locked balance in `_partition`.
     * @param _partition   Partition whose locked balance is being anchored.
     * @param _tokenHolder Owner of the partition-scoped locked balance.
     * @param _labaf       LABAF value to record.
     */
    function setTotalLockLabafByPartition(bytes32 _partition, address _tokenHolder, uint256 _labaf) internal {
        _adjustBalancesStorage().labafLockedAmountByAccountAndPartition[_tokenHolder][_partition] = _labaf;
    }

    /**
     * @notice Clears the LABAF entry associated with a released lock.
     * @dev Frees storage by deleting the `(_tokenHolder, _partition, _lockId)` slot.
     * @param _partition   Partition that held the lock.
     * @param _tokenHolder Owner of the released lock.
     * @param _lockId      Identifier of the lock being removed.
     */
    function removeLabafLock(bytes32 _partition, address _tokenHolder, uint256 _lockId) internal {
        delete _adjustBalancesStorage().labafLockedAmountByAccountPartitionAndId[_tokenHolder][_partition][_lockId];
    }

    /**
     * @notice Stores the LABAF for an individual hold identified by `_holdId`.
     * @dev Mirrors `setLockLabafById` for the holds mapping.
     * @param _partition   Partition holding the held balance.
     * @param _tokenHolder Owner of the held balance.
     * @param _holdId      Identifier of the hold record.
     * @param _labaf       LABAF value to anchor the hold against.
     */
    function setHeldLabafById(bytes32 _partition, address _tokenHolder, uint256 _holdId, uint256 _labaf) internal {
        _adjustBalancesStorage().labafHeldAmountByAccountPartitionAndId[_tokenHolder][_partition][_holdId] = _labaf;
    }

    /**
     * @notice Sets the LABAF anchoring `_tokenHolder`'s aggregate held balance.
     * @param _tokenHolder Account whose total-hold LABAF is being refreshed.
     * @param _labaf       LABAF value to record.
     */
    function setTotalHeldLabaf(address _tokenHolder, uint256 _labaf) internal {
        _adjustBalancesStorage().labafHeldAmountByAccount[_tokenHolder] = _labaf;
    }

    /**
     * @notice Sets the LABAF anchoring `_tokenHolder`'s held balance in `_partition`.
     * @param _partition   Partition whose held balance is being anchored.
     * @param _tokenHolder Owner of the partition-scoped held balance.
     * @param _labaf       LABAF value to record.
     */
    function setTotalHeldLabafByPartition(bytes32 _partition, address _tokenHolder, uint256 _labaf) internal {
        _adjustBalancesStorage().labafHeldAmountByAccountAndPartition[_tokenHolder][_partition] = _labaf;
    }

    /**
     * @notice Clears the LABAF entry associated with a released hold.
     * @param _partition   Partition that held the hold.
     * @param _tokenHolder Owner of the released hold.
     * @param _holdId      Identifier of the hold being removed.
     */
    function removeLabafHold(bytes32 _partition, address _tokenHolder, uint256 _holdId) internal {
        delete _adjustBalancesStorage().labafHeldAmountByAccountPartitionAndId[_tokenHolder][_partition][_holdId];
    }

    /**
     * @notice Sets the LABAF anchoring `_tokenHolder`'s aggregate frozen balance.
     * @param _tokenHolder Account whose total-freeze LABAF is being refreshed.
     * @param _labaf       LABAF value to record.
     */
    function setTotalFreezeLabaf(address _tokenHolder, uint256 _labaf) internal {
        _adjustBalancesStorage().labafFrozenAmountByAccount[_tokenHolder] = _labaf;
    }

    /**
     * @notice Sets the LABAF anchoring `_tokenHolder`'s frozen balance in `_partition`.
     * @param _partition   Partition whose frozen balance is being anchored.
     * @param _tokenHolder Owner of the partition-scoped frozen balance.
     * @param _labaf       LABAF value to record.
     */
    function setTotalFreezeLabafByPartition(bytes32 _partition, address _tokenHolder, uint256 _labaf) internal {
        _adjustBalancesStorage().labafFrozenAmountByAccountAndPartition[_tokenHolder][_partition] = _labaf;
    }

    /**
     * @notice Stores the LABAF for a specific clearing operation.
     * @dev Keyed by the four-dimensional `(tokenHolder, partition, clearingOperationType, clearingId)`
     *      tuple carried inside `_clearingOperationIdentifier`.
     * @param _clearingOperationIdentifier Tuple identifying the clearing record.
     * @param _labaf                       LABAF value to anchor the clearing against.
     */
    function setClearedLabafById(
        IClearingTypes.ClearingOperationIdentifier memory _clearingOperationIdentifier,
        uint256 _labaf
    ) internal {
        _adjustBalancesStorage().labafClearedAmountByAccountPartitionTypeAndId[
            _clearingOperationIdentifier.tokenHolder
        ][_clearingOperationIdentifier.partition][_clearingOperationIdentifier.clearingOperationType][
                _clearingOperationIdentifier.clearingId
            ] = _labaf;
    }

    /**
     * @notice Sets the LABAF anchoring `_tokenHolder`'s aggregate cleared balance.
     * @param _tokenHolder Account whose total-cleared LABAF is being refreshed.
     * @param _labaf       LABAF value to record.
     */
    function setTotalClearedLabaf(address _tokenHolder, uint256 _labaf) internal {
        _adjustBalancesStorage().labafClearedAmountByAccount[_tokenHolder] = _labaf;
    }

    /**
     * @notice Sets the LABAF anchoring `_tokenHolder`'s cleared balance in `_partition`.
     * @param _partition   Partition whose cleared balance is being anchored.
     * @param _tokenHolder Owner of the partition-scoped cleared balance.
     * @param _labaf       LABAF value to record.
     */
    function setTotalClearedLabafByPartition(bytes32 _partition, address _tokenHolder, uint256 _labaf) internal {
        _adjustBalancesStorage().labafClearedAmountByAccountAndPartition[_tokenHolder][_partition] = _labaf;
    }

    /**
     * @notice Clears the LABAF entry for an executed or cancelled clearing operation.
     * @param _clearingOperationIdentifier Tuple identifying the clearing record to remove.
     */
    function removeLabafClearing(
        IClearingTypes.ClearingOperationIdentifier memory _clearingOperationIdentifier
    ) internal {
        delete _adjustBalancesStorage().labafClearedAmountByAccountPartitionTypeAndId[
            _clearingOperationIdentifier.tokenHolder
        ][_clearingOperationIdentifier.partition][_clearingOperationIdentifier.clearingOperationType][
                _clearingOperationIdentifier.clearingId
            ];
    }

    /**
     * @notice Applies a global balance-adjustment factor across decimals, total supply and ABAF.
     * @dev Sequencing matters: decimals, ABAF and total-supply snapshots are taken FIRST so the
     *      pre-adjustment values remain queryable for historical reads, then ERC20 totals, ERC20
     *      decimals and the cap are mutated, and finally ABAF is multiplied through. Emits
     *      `IAdjustBalances.AdjustmentBalanceSet` with the original message sender obtained via
     *      `EvmAccessors.getMsgSender` so meta-transaction relayers are not credited.
     * @param _factor   Multiplicative factor applied to total supply, cap and ABAF.
     * @param _decimals New ERC20 decimals value following the adjustment.
     */
    function adjustBalances(uint256 _factor, uint8 _decimals) internal {
        SnapshotsStorageWrapper.updateDecimalsSnapshot();
        SnapshotsStorageWrapper.updateAbafSnapshot();
        SnapshotsStorageWrapper.updateAssetTotalSupplySnapshot();
        ERC20StorageWrapper.adjustTotalSupply(_factor);
        ERC20StorageWrapper.adjustDecimals(_decimals);
        CapStorageWrapper.adjustMaxSupply(_factor);
        updateAbaf(_factor);

        emit IAdjustBalances.AdjustmentBalanceSet(EvmAccessors.getMsgSender(), _factor, _decimals);
    }

    /**
     * @notice Reconciles a partition's total supply and cap with the current ABAF.
     * @dev No-op when the partition's LABAF already matches ABAF. Otherwise computes
     *      `factor = abaf / labaf` and applies it to both the ERC1410 total supply and the cap,
     *      then refreshes the partition LABAF so subsequent reconciliations short-circuit.
     * @param _partition Partition to bring back into alignment with the asset-wide factor.
     */
    function adjustTotalAndMaxSupplyForPartition(bytes32 _partition) internal {
        uint256 abaf = getAbaf();
        uint256 labaf = getLabafByPartition(_partition);

        if (abaf == labaf) return;

        uint256 factor = calculateFactor(abaf, labaf);

        ERC1410StorageWrapper.adjustTotalSupplyByPartition(_partition, factor);
        CapStorageWrapper.adjustMaxSupplyByPartition(_partition, factor);
        updateLabafByPartition(_partition);
    }

    /**
     * @notice Returns `_account`'s aggregate LABAF, collapsing an uninitialised zero to one.
     * @param _account Account whose LABAF is requested.
     * @return The stored LABAF, or 1 when no balance adjustment has anchored the account yet.
     */
    function getLabafByUser(address _account) internal view returns (uint256) {
        return zeroToOne(_adjustBalancesStorage().labaf[_account]);
    }

    /**
     * @notice Returns the LABAF for `_partition`, collapsing an uninitialised zero to one.
     * @param _partition Partition whose LABAF is requested.
     * @return The stored partition LABAF, or 1 when never anchored.
     */
    function getLabafByPartition(bytes32 _partition) internal view returns (uint256) {
        return zeroToOne(_adjustBalancesStorage().labafByPartition[_partition]);
    }

    /**
     * @notice Returns the LABAF anchoring `_account`'s balance in `_partition`.
     * @dev Resolves the ERC1410 partition index for the account and delegates to
     *      `getLabafByUserAndPartitionIndex`, which returns 1 when the holder has no entry yet.
     * @param _partition Partition identifier.
     * @param _account   Account holding the partitioned balance.
     * @return LABAF associated with the holder's position in the partition.
     */
    function getLabafByUserAndPartition(bytes32 _partition, address _account) internal view returns (uint256) {
        return
            getLabafByUserAndPartitionIndex(ERC1410StorageWrapper.partitionsToIndexes(_account, _partition), _account);
    }

    /**
     * @notice Returns the LABAF stored at the supplied 1-based partition index for `_account`.
     * @dev Returns 1 (the neutral factor) when `_partitionIndex` is zero, meaning the account is
     *      not a member of the partition yet. The underlying array is zero-based, hence `- 1`.
     * @param _partitionIndex One-based partition index, as exposed by ERC1410 partition tracking.
     * @param _account        Owner of the partitioned position.
     * @return Stored LABAF or the neutral factor when no entry exists.
     */
    function getLabafByUserAndPartitionIndex(
        uint256 _partitionIndex,
        address _account
    ) internal view returns (uint256) {
        return
            _partitionIndex == 0
                ? 1
                : zeroToOne(_adjustBalancesStorage().labafUserPartition[_account][_partitionIndex - 1]);
    }

    /**
     * @notice Returns the LABAF anchoring the allowance from `_owner` to `_spender`.
     * @param _owner   Account that granted the allowance.
     * @param _spender Account permitted to spend.
     * @return Stored allowance LABAF, defaulting to 1 when never anchored.
     */
    function getAllowanceLabaf(address _owner, address _spender) internal view returns (uint256) {
        return zeroToOne(_adjustBalancesStorage().labafsAllowances[_owner][_spender]);
    }

    /**
     * @notice Returns the LABAF anchoring `_tokenHolder`'s aggregate locked balance.
     * @param _tokenHolder Account whose total-lock LABAF is requested.
     * @return Stored LABAF, defaulting to 1 when never anchored.
     */
    function getTotalLockLabaf(address _tokenHolder) internal view returns (uint256) {
        return zeroToOne(_adjustBalancesStorage().labafLockedAmountByAccount[_tokenHolder]);
    }

    /**
     * @notice Returns the LABAF anchoring `_tokenHolder`'s locked balance in `_partition`.
     * @param _partition   Partition whose locked balance LABAF is requested.
     * @param _tokenHolder Account holding the locked balance.
     * @return Stored LABAF, defaulting to 1 when never anchored.
     */
    function getTotalLockLabafByPartition(bytes32 _partition, address _tokenHolder) internal view returns (uint256) {
        return zeroToOne(_adjustBalancesStorage().labafLockedAmountByAccountAndPartition[_tokenHolder][_partition]);
    }

    /**
     * @notice Returns the LABAF anchoring an individual lock identified by `_lockId`.
     * @param _partition   Partition the lock belongs to.
     * @param _tokenHolder Owner of the locked balance.
     * @param _lockId      Identifier of the lock record.
     * @return Stored LABAF, defaulting to 1 when never anchored.
     */
    function getLockLabafById(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _lockId
    ) internal view returns (uint256) {
        return
            zeroToOne(
                _adjustBalancesStorage().labafLockedAmountByAccountPartitionAndId[_tokenHolder][_partition][_lockId]
            );
    }

    /**
     * @notice Returns the LABAF anchoring `_tokenHolder`'s aggregate held balance.
     * @param _tokenHolder Account whose total-hold LABAF is requested.
     * @return Stored LABAF, defaulting to 1 when never anchored.
     */
    function getTotalHeldLabaf(address _tokenHolder) internal view returns (uint256) {
        return zeroToOne(_adjustBalancesStorage().labafHeldAmountByAccount[_tokenHolder]);
    }

    /**
     * @notice Returns the LABAF anchoring `_tokenHolder`'s held balance in `_partition`.
     * @param _partition   Partition whose held balance LABAF is requested.
     * @param _tokenHolder Account holding the held balance.
     * @return Stored LABAF, defaulting to 1 when never anchored.
     */
    function getTotalHeldLabafByPartition(bytes32 _partition, address _tokenHolder) internal view returns (uint256) {
        return zeroToOne(_adjustBalancesStorage().labafHeldAmountByAccountAndPartition[_tokenHolder][_partition]);
    }

    /**
     * @notice Returns the LABAF anchoring an individual hold identified by `_holdId`.
     * @param _partition   Partition the hold belongs to.
     * @param _tokenHolder Owner of the held balance.
     * @param _holdId      Identifier of the hold record.
     * @return Stored LABAF, defaulting to 1 when never anchored.
     */
    function getHoldLabafById(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _holdId
    ) internal view returns (uint256) {
        return
            zeroToOne(
                _adjustBalancesStorage().labafHeldAmountByAccountPartitionAndId[_tokenHolder][_partition][_holdId]
            );
    }

    /**
     * @notice Returns the LABAF anchoring `_tokenHolder`'s aggregate frozen balance.
     * @param _tokenHolder Account whose total-freeze LABAF is requested.
     * @return Stored LABAF, defaulting to 1 when never anchored.
     */
    function getTotalFrozenLabaf(address _tokenHolder) internal view returns (uint256) {
        return zeroToOne(_adjustBalancesStorage().labafFrozenAmountByAccount[_tokenHolder]);
    }

    /**
     * @notice Returns the LABAF anchoring `_tokenHolder`'s frozen balance in `_partition`.
     * @param _partition   Partition whose frozen balance LABAF is requested.
     * @param _tokenHolder Account holding the frozen balance.
     * @return Stored LABAF, defaulting to 1 when never anchored.
     */
    function getTotalFrozenLabafByPartition(bytes32 _partition, address _tokenHolder) internal view returns (uint256) {
        return zeroToOne(_adjustBalancesStorage().labafFrozenAmountByAccountAndPartition[_tokenHolder][_partition]);
    }

    /**
     * @notice Returns the LABAF anchoring `_tokenHolder`'s aggregate cleared balance.
     * @param _tokenHolder Account whose total-cleared LABAF is requested.
     * @return Stored LABAF, defaulting to 1 when never anchored.
     */
    function getTotalClearedLabaf(address _tokenHolder) internal view returns (uint256) {
        return zeroToOne(_adjustBalancesStorage().labafClearedAmountByAccount[_tokenHolder]);
    }

    /**
     * @notice Returns the LABAF anchoring `_tokenHolder`'s cleared balance in `_partition`.
     * @param _partition   Partition whose cleared balance LABAF is requested.
     * @param _tokenHolder Account holding the cleared balance.
     * @return Stored LABAF, defaulting to 1 when never anchored.
     */
    function getTotalClearedLabafByPartition(bytes32 _partition, address _tokenHolder) internal view returns (uint256) {
        return zeroToOne(_adjustBalancesStorage().labafClearedAmountByAccountAndPartition[_tokenHolder][_partition]);
    }

    /**
     * @notice Returns the LABAF anchoring a specific clearing operation.
     * @dev Reads the four-dimensional clearings mapping keyed by the identifier tuple.
     * @param _clearingOperationIdentifier Tuple identifying the clearing record.
     * @return Stored LABAF, defaulting to 1 when never anchored.
     */
    function getClearingLabafById(
        IClearingTypes.ClearingOperationIdentifier memory _clearingOperationIdentifier
    ) internal view returns (uint256) {
        return
            zeroToOne(
                _adjustBalancesStorage().labafClearedAmountByAccountPartitionTypeAndId[
                    _clearingOperationIdentifier.tokenHolder
                ][_clearingOperationIdentifier.partition][_clearingOperationIdentifier.clearingOperationType][
                        _clearingOperationIdentifier.clearingId
                    ]
            );
    }

    /**
     * @notice Computes the projection factor between the supplied ABAF and `tokenHolder`'s LABAF.
     * @param abaf        Reference asset-wide balance-adjustment factor.
     * @param tokenHolder Account whose LABAF is used as the divisor.
     * @return factor `abaf / labaf(tokenHolder)`, with `labaf` collapsed to 1 when uninitialised.
     */
    function calculateFactorByAbafAndTokenHolder(
        uint256 abaf,
        address tokenHolder
    ) internal view returns (uint256 factor) {
        factor = calculateFactor(abaf, getLabafByUser(tokenHolder));
    }

    /**
     * @notice Computes the projection factor for a holder's specific partitioned position.
     * @param abaf           Reference asset-wide balance-adjustment factor.
     * @param tokenHolder    Account owning the partitioned position.
     * @param partitionIndex One-based partition index in the holder's partition list.
     * @return factor `abaf / labaf` for the indexed partition, with `labaf` collapsed to 1 when
     *         the position has no anchoring entry yet.
     */
    function calculateFactorByTokenHolderAndPartitionIndex(
        uint256 abaf,
        address tokenHolder,
        uint256 partitionIndex
    ) internal view returns (uint256 factor) {
        factor = calculateFactor(abaf, getLabafByUserAndPartitionIndex(partitionIndex, tokenHolder));
    }

    /**
     * @notice Computes the projection factor for a holder's locked balance at a historical instant.
     * @dev Combines the ABAF projected to `timestamp` via `getAbafAdjustedAt` with the holder's
     *      current total-lock LABAF.
     * @param tokenHolder Account whose locked balance is being projected.
     * @param timestamp   Historical timestamp at which to evaluate ABAF.
     * @return factor Projection factor `abaf(timestamp) / labafLock(tokenHolder)`.
     */
    function calculateFactorForLockedAmountByTokenHolderAdjustedAt(
        address tokenHolder,
        uint256 timestamp
    ) internal view returns (uint256 factor) {
        factor = calculateFactor(getAbafAdjustedAt(timestamp), getTotalLockLabaf(tokenHolder));
    }

    /**
     * @notice Computes the projection factor for a holder's frozen balance at a historical instant.
     * @param tokenHolder Account whose frozen balance is being projected.
     * @param timestamp   Historical timestamp at which to evaluate ABAF.
     * @return factor Projection factor `abaf(timestamp) / labafFrozen(tokenHolder)`.
     */
    function calculateFactorForFrozenAmountByTokenHolderAdjustedAt(
        address tokenHolder,
        uint256 timestamp
    ) internal view returns (uint256 factor) {
        factor = calculateFactor(getAbafAdjustedAt(timestamp), getTotalFrozenLabaf(tokenHolder));
    }

    /**
     * @notice Computes the projection factor for a holder's held balance at a historical instant.
     * @param tokenHolder Account whose held balance is being projected.
     * @param timestamp   Historical timestamp at which to evaluate ABAF.
     * @return factor Projection factor `abaf(timestamp) / labafHeld(tokenHolder)`.
     */
    function calculateFactorForHeldAmountByTokenHolderAdjustedAt(
        address tokenHolder,
        uint256 timestamp
    ) internal view returns (uint256 factor) {
        factor = calculateFactor(getAbafAdjustedAt(timestamp), getTotalHeldLabaf(tokenHolder));
    }

    /**
     * @notice Computes the projection factor for a holder's cleared balance at a historical instant.
     * @param tokenHolder Account whose cleared balance is being projected.
     * @param timestamp   Historical timestamp at which to evaluate ABAF.
     * @return factor Projection factor `abaf(timestamp) / labafCleared(tokenHolder)`.
     */
    function calculateFactorForClearedAmountByTokenHolderAdjustedAt(
        address tokenHolder,
        uint256 timestamp
    ) internal view returns (uint256 factor) {
        factor = calculateFactor(getAbafAdjustedAt(timestamp), getTotalClearedLabaf(tokenHolder));
    }

    /**
     * @notice Returns the total supply projected to `_timestamp`.
     * @dev Multiplies the current ERC1410 total supply by the pending ABAF reported by the
     *      scheduled-tasks storage wrapper for that timestamp.
     * @param _timestamp Historical or future timestamp to project to.
     * @return Total supply scaled by the pending ABAF at `_timestamp`.
     */
    function totalSupplyAdjustedAt(uint256 _timestamp) internal view returns (uint256) {
        (uint256 pendingABAF, ) = getPendingScheduledBalanceAdjustmentsAt(_timestamp, false);
        return ERC1410StorageWrapper.totalSupply() * pendingABAF;
    }

    /**
     * @notice Returns a partition's total supply projected to `_timestamp`.
     * @dev Scales the partition's current total supply by `abaf(_timestamp) / labafByPartition`.
     * @param _partition Partition identifier.
     * @param _timestamp Historical or future timestamp to project to.
     * @return Partition total supply at the projected factor.
     */
    function totalSupplyByPartitionAdjustedAt(bytes32 _partition, uint256 _timestamp) internal view returns (uint256) {
        return
            ERC1410StorageWrapper.totalSupplyByPartition(_partition) *
            calculateFactor(getAbafAdjustedAt(_timestamp), getLabafByPartition(_partition));
    }

    /**
     * @notice Returns `_tokenHolder`'s aggregate balance projected to `_timestamp`.
     * @param _tokenHolder Account whose balance is being projected.
     * @param _timestamp   Historical or future timestamp to project to.
     * @return Holder's balance at the projected factor.
     */
    function balanceOfAdjustedAt(address _tokenHolder, uint256 _timestamp) internal view returns (uint256) {
        return
            ERC1410StorageWrapper.balanceOf(_tokenHolder) *
            calculateFactor(getAbafAdjustedAt(_timestamp), getLabafByUser(_tokenHolder));
    }

    /**
     * @notice Returns `_tokenHolder`'s balance in `_partition` projected to `_timestamp`.
     * @param _partition   Partition identifier.
     * @param _tokenHolder Account holding the partitioned balance.
     * @param _timestamp   Historical or future timestamp to project to.
     * @return Partitioned holder balance at the projected factor.
     */
    function balanceOfByPartitionAdjustedAt(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _timestamp
    ) internal view returns (uint256) {
        return
            ERC1410StorageWrapper.balanceOfByPartition(_partition, _tokenHolder) *
            calculateFactor(getAbafAdjustedAt(_timestamp), getLabafByUserAndPartition(_partition, _tokenHolder));
    }

    /**
     * @notice Returns the aggregate pending ABAF and decimals delta scheduled up to `_timestamp`.
     * @dev Delegates to `ScheduledTasksStorageWrapper`, which walks queued balance adjustments and
     *      composes their factors and decimal shifts.
     * @param _timestamp Timestamp up to which scheduled adjustments are accumulated.
     * @param _includeDisabled Whether to include adjustments that have been disabled but not removed from the queue.
     * @return pendingAbaf_     Multiplicative ABAF aggregating every adjustment due by `_timestamp`.
     * @return pendingDecimals_ Net decimals delta produced by those adjustments.
     */
    function getPendingScheduledBalanceAdjustmentsAt(
        uint256 _timestamp,
        bool _includeDisabled
    ) internal view returns (uint256 pendingAbaf_, uint8 pendingDecimals_) {
        return ScheduledTasksStorageWrapper.getPendingScheduledBalanceAdjustmentsAt(_timestamp, _includeDisabled);
    }

    /**
     * @notice Returns the current ABAF, collapsing an uninitialised zero to one.
     * @return Asset-wide balance-adjustment factor, defaulting to 1 before any adjustment.
     */
    function getAbaf() internal view returns (uint256) {
        return zeroToOne(_adjustBalancesStorage().abaf);
    }

    /**
     * @notice Returns ABAF projected to `_timestamp`, combining current ABAF with pending schedules.
     * @param _timestamp Timestamp to project to.
     * @return ABAF multiplied by the pending factor from `getPendingScheduledBalanceAdjustmentsAt`.
     */
    function getAbafAdjustedAt(uint256 _timestamp) internal view returns (uint256) {
        (uint256 pendingAbaf, ) = getPendingScheduledBalanceAdjustmentsAt(_timestamp, false);
        return getAbaf() * pendingAbaf;
    }

    /**
     * @notice Reverts if applying `_factor` / `_decimals` would overflow decimals, ABAF or total supply.
     * @dev Folds the next due scheduled adjustment into the projected state so combined effects are
     *      checked. Reverts with `DecimalsOverflow`, `FactorOverflow` or `TotalSupplyOverflow`.
     * @param _factor   Numerator of the prospective adjustment.
     * @param _decimals Denominator exponent of the prospective adjustment.
     */
    function checkNotOverflowingAdjustment(uint256 _factor, uint8 _decimals) internal view {
        (uint256 pendingAbaf, uint8 pendingDecimals) = getPendingScheduledBalanceAdjustmentsAt(MAX_UINT256, false);

        uint256 totalSupply = zeroToOne(ERC20StorageWrapper.totalSupply()) * pendingAbaf;
        uint256 abaf = getAbaf() * pendingAbaf;
        uint8 decimals = ERC20StorageWrapper.decimals() + pendingDecimals;

        if (MAX_UINT8 - decimals < _decimals) revert IAdjustBalances.DecimalsOverflow();
        if (MAX_UINT256 / abaf < _factor) revert IAdjustBalances.FactorOverflow();
        if (MAX_UINT256 / totalSupply < _factor) revert IAdjustBalances.TotalSupplyOverflow();
    }

    /**
     * @notice Integer division `_abaf / _labaf`.
     * @dev Caller MUST ensure `_labaf` is non-zero — the library's getters always return 1 for
     *      uninitialised slots specifically to keep this safe. Result truncates toward zero.
     * @param _abaf  Reference asset-wide balance-adjustment factor.
     * @param _labaf LABAF anchor against which to project.
     * @return factor_ Integer projection factor.
     */
    function calculateFactor(uint256 _abaf, uint256 _labaf) internal pure returns (uint256 factor_) {
        factor_ = _abaf / _labaf;
    }

    /**
     * @notice Returns 1 when `_input` is zero, otherwise returns `_input` unchanged.
     * @dev Used to keep multiplicative projections defined for uninitialised storage slots.
     * @param _input Value to normalise.
     * @return Either 1 or the original `_input`.
     */
    function zeroToOne(uint256 _input) internal pure returns (uint256) {
        return _input == 0 ? 1 : _input;
    }

    /**
     * @notice Reverts when `_factor` would degenerate a multiplicative projection to zero.
     * @dev Reverts with `IAdjustBalances.FactorIsZero`; callers use this to guard inputs supplied
     *      by external transactions before they reach storage mutations.
     * @param _factor Balance-adjustment factor to validate.
     */
    function checkValidFactor(uint256 _factor) internal pure {
        if (_factor == 0) revert IAdjustBalances.FactorIsZero();
    }

    /**
     * @notice Returns the `AdjustBalancesStorage` struct pinned at the ERC-7201 namespace slot.
     * @dev Uses inline assembly to bind `adjustBalancesStorage_.slot` to
     *      `STORAGE_LOCATION_ADJUST_BALANCES`, providing a single source of truth for every
     *      accessor in this library. Equivalent to the standard OZ ERC-7201 pattern.
     * @return adjustBalancesStorage_ Storage reference to the namespaced struct.
     */
    function _adjustBalancesStorage() private pure returns (AdjustBalancesStorage storage adjustBalancesStorage_) {
        bytes32 position = STORAGE_LOCATION_ADJUST_BALANCES;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            adjustBalancesStorage_.slot := position
        }
    }
}
