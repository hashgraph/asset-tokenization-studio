// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _ADJUST_BALANCES_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { IClearingTypes } from "../../facets/layer_1/clearing/IClearingTypes.sol";
import { ERC1410StorageWrapper } from "./ERC1410StorageWrapper.sol";
import { ScheduledTasksStorageWrapper } from "./ScheduledTasksStorageWrapper.sol";
import { SnapshotsStorageWrapper } from "./SnapshotsStorageWrapper.sol";
import { ERC20StorageWrapper } from "./ERC20StorageWrapper.sol";
import { CapStorageWrapper } from "../core/CapStorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { IAdjustBalances } from "../../facets/adjustBalances/IAdjustBalances.sol";
import { MAX_UINT256, MAX_UINT8 } from "../../constants/values.sol";

struct AdjustBalancesStorage {
    mapping(address => uint256[]) labafUserPartition;
    uint256 abaf;
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
}

library AdjustBalancesStorageWrapper {
    /**
     * @notice Multiplies the stored Aggregate Balance Adjustment Factor (ABAF) by `factor`.
     * @dev Called by `adjustBalances` so subsequent balance reads scale with the new factor.
     * @param factor Multiplier applied to the current ABAF.
     */
    function updateAbaf(uint256 factor) internal {
        adjustBalancesStorage().abaf = getAbaf() * factor;
    }

    /**
     * @notice Records `labaf` as the Last Adjusted Balance Adjustment Factor for `tokenHolder`.
     * @param labaf       LABAF value captured for the holder.
     * @param tokenHolder Account whose account-level LABAF marker is updated.
     */
    function updateLabafByTokenHolder(uint256 labaf, address tokenHolder) internal {
        adjustBalancesStorage().labaf[tokenHolder] = labaf;
    }

    /**
     * @notice Stamps the current ABAF onto `partition`'s LABAF marker.
     * @dev Called after a partition-level supply rebase has caught up with the global ABAF.
     * @param partition Identifier of the partition whose LABAF is refreshed.
     */
    function updateLabafByPartition(bytes32 partition) internal {
        adjustBalancesStorage().labafByPartition[partition] = getAbaf();
    }

    /**
     * @notice Appends `_labaf` to `_tokenHolder`'s per-partition LABAF history.
     * @dev The array index stays aligned with the holder's partition list in ERC1410 storage.
     * @param _tokenHolder Account whose partition LABAF history is extended.
     * @param _labaf       LABAF value to push.
     */
    function pushLabafUserPartition(address _tokenHolder, uint256 _labaf) internal {
        adjustBalancesStorage().labafUserPartition[_tokenHolder].push(_labaf);
    }

    /**
     * @notice Removes the most recent entry of `_tokenHolder`'s per-partition LABAF history.
     * @dev Mirrors a partition removal in ERC1410 storage to keep array indexes aligned.
     * @param _tokenHolder Account whose partition LABAF history is shortened.
     */
    function popLabafUserPartition(address _tokenHolder) internal {
        adjustBalancesStorage().labafUserPartition[_tokenHolder].pop();
    }

    /**
     * @notice Overwrites a specific entry of `tokenHolder`'s per-partition LABAF history.
     * @dev `partitionIndex` is 1-based to match the ERC1410 partition index convention.
     * @param labaf          New LABAF value.
     * @param tokenHolder    Account whose history entry is updated.
     * @param partitionIndex 1-based position in the holder's partition list.
     */
    function updateLabafByTokenHolderAndPartitionIndex(
        uint256 labaf,
        address tokenHolder,
        uint256 partitionIndex
    ) internal {
        adjustBalancesStorage().labafUserPartition[tokenHolder][partitionIndex - 1] = labaf;
    }

    /**
     * @notice Records the LABAF observed when an allowance was last touched.
     * @param _owner   Owner of the allowance.
     * @param _spender Address authorised to spend on the owner's behalf.
     * @param _labaf   LABAF value tied to the allowance.
     */
    function updateAllowanceLabaf(address _owner, address _spender, uint256 _labaf) internal {
        adjustBalancesStorage().labafsAllowances[_owner][_spender] = _labaf;
    }

    /**
     * @notice Records the LABAF observed when a specific lock was last adjusted.
     * @param _partition   Partition the lock belongs to.
     * @param _tokenHolder Account owning the locked amount.
     * @param _lockId      Identifier of the lock.
     * @param _labaf       LABAF value to persist.
     */
    function setLockLabafById(bytes32 _partition, address _tokenHolder, uint256 _lockId, uint256 _labaf) internal {
        adjustBalancesStorage().labafLockedAmountByAccountPartitionAndId[_tokenHolder][_partition][_lockId] = _labaf;
    }

    /**
     * @notice Records the LABAF observed when the holder's total locked amount was last adjusted.
     * @param _tokenHolder Account whose aggregate locked LABAF is updated.
     * @param _labaf       LABAF value to persist.
     */
    function setTotalLockLabaf(address _tokenHolder, uint256 _labaf) internal {
        adjustBalancesStorage().labafLockedAmountByAccount[_tokenHolder] = _labaf;
    }

    /**
     * @notice Records the LABAF observed when a holder's partition-level locked total was adjusted.
     * @param _partition   Partition concerned.
     * @param _tokenHolder Account whose partition locked LABAF is updated.
     * @param _labaf       LABAF value to persist.
     */
    function setTotalLockLabafByPartition(bytes32 _partition, address _tokenHolder, uint256 _labaf) internal {
        adjustBalancesStorage().labafLockedAmountByAccountAndPartition[_tokenHolder][_partition] = _labaf;
    }

    /**
     * @notice Deletes the LABAF entry associated with a specific lock.
     * @dev Called when a lock is released so stale factors do not influence subsequent reads.
     * @param _partition   Partition the lock belonged to.
     * @param _tokenHolder Account that owned the lock.
     * @param _lockId      Identifier of the lock being cleared.
     */
    function removeLabafLock(bytes32 _partition, address _tokenHolder, uint256 _lockId) internal {
        delete adjustBalancesStorage().labafLockedAmountByAccountPartitionAndId[_tokenHolder][_partition][_lockId];
    }

    /**
     * @notice Records the LABAF observed when a specific hold was last adjusted.
     * @param _partition   Partition the hold belongs to.
     * @param _tokenHolder Account owning the held amount.
     * @param _holdId      Identifier of the hold.
     * @param _labaf       LABAF value to persist.
     */
    function setHeldLabafById(bytes32 _partition, address _tokenHolder, uint256 _holdId, uint256 _labaf) internal {
        adjustBalancesStorage().labafHeldAmountByAccountPartitionAndId[_tokenHolder][_partition][_holdId] = _labaf;
    }

    /**
     * @notice Records the LABAF observed when the holder's total held amount was last adjusted.
     * @param _tokenHolder Account whose aggregate held LABAF is updated.
     * @param _labaf       LABAF value to persist.
     */
    function setTotalHeldLabaf(address _tokenHolder, uint256 _labaf) internal {
        adjustBalancesStorage().labafHeldAmountByAccount[_tokenHolder] = _labaf;
    }

    /**
     * @notice Records the LABAF observed when a holder's partition-level held total was adjusted.
     * @param _partition   Partition concerned.
     * @param _tokenHolder Account whose partition held LABAF is updated.
     * @param _labaf       LABAF value to persist.
     */
    function setTotalHeldLabafByPartition(bytes32 _partition, address _tokenHolder, uint256 _labaf) internal {
        adjustBalancesStorage().labafHeldAmountByAccountAndPartition[_tokenHolder][_partition] = _labaf;
    }

    /**
     * @notice Deletes the LABAF entry associated with a specific hold.
     * @dev Called when a hold is released so stale factors do not influence subsequent reads.
     * @param _partition   Partition the hold belonged to.
     * @param _tokenHolder Account that owned the hold.
     * @param _holdId      Identifier of the hold being cleared.
     */
    function removeLabafHold(bytes32 _partition, address _tokenHolder, uint256 _holdId) internal {
        delete adjustBalancesStorage().labafHeldAmountByAccountPartitionAndId[_tokenHolder][_partition][_holdId];
    }

    /**
     * @notice Records the LABAF observed when the holder's total frozen amount was last adjusted.
     * @param _tokenHolder Account whose aggregate frozen LABAF is updated.
     * @param _labaf       LABAF value to persist.
     */
    function setTotalFreezeLabaf(address _tokenHolder, uint256 _labaf) internal {
        adjustBalancesStorage().labafFrozenAmountByAccount[_tokenHolder] = _labaf;
    }

    /**
     * @notice Records the LABAF observed when a holder's partition-level frozen total was adjusted.
     * @param _partition   Partition concerned.
     * @param _tokenHolder Account whose partition frozen LABAF is updated.
     * @param _labaf       LABAF value to persist.
     */
    function setTotalFreezeLabafByPartition(bytes32 _partition, address _tokenHolder, uint256 _labaf) internal {
        adjustBalancesStorage().labafFrozenAmountByAccountAndPartition[_tokenHolder][_partition] = _labaf;
    }

    /**
     * @notice Records the LABAF observed when a specific clearing operation was last adjusted.
     * @param _clearingOperationIdentifier Tuple identifying holder, partition, operation type and id.
     * @param _labaf                       LABAF value to persist.
     */
    function setClearedLabafById(
        IClearingTypes.ClearingOperationIdentifier memory _clearingOperationIdentifier,
        uint256 _labaf
    ) internal {
        adjustBalancesStorage().labafClearedAmountByAccountPartitionTypeAndId[_clearingOperationIdentifier.tokenHolder][
            _clearingOperationIdentifier.partition
        ][_clearingOperationIdentifier.clearingOperationType][_clearingOperationIdentifier.clearingId] = _labaf;
    }

    /**
     * @notice Records the LABAF observed when the holder's total cleared amount was last adjusted.
     * @param _tokenHolder Account whose aggregate cleared LABAF is updated.
     * @param _labaf       LABAF value to persist.
     */
    function setTotalClearedLabaf(address _tokenHolder, uint256 _labaf) internal {
        adjustBalancesStorage().labafClearedAmountByAccount[_tokenHolder] = _labaf;
    }

    /**
     * @notice Records the LABAF observed when a holder's partition-level cleared total was adjusted.
     * @param _partition   Partition concerned.
     * @param _tokenHolder Account whose partition cleared LABAF is updated.
     * @param _labaf       LABAF value to persist.
     */
    function setTotalClearedLabafByPartition(bytes32 _partition, address _tokenHolder, uint256 _labaf) internal {
        adjustBalancesStorage().labafClearedAmountByAccountAndPartition[_tokenHolder][_partition] = _labaf;
    }

    /**
     * @notice Deletes the LABAF entry associated with a specific clearing operation.
     * @dev Called when the operation is finalised so stale factors do not affect future reads.
     * @param _clearingOperationIdentifier Tuple identifying the clearing entry to remove.
     */
    function removeLabafClearing(
        IClearingTypes.ClearingOperationIdentifier memory _clearingOperationIdentifier
    ) internal {
        delete adjustBalancesStorage().labafClearedAmountByAccountPartitionTypeAndId[
            _clearingOperationIdentifier.tokenHolder
        ][_clearingOperationIdentifier.partition][_clearingOperationIdentifier.clearingOperationType][
                _clearingOperationIdentifier.clearingId
            ];
    }

    /**
     * @notice Applies an immediate balance adjustment of ratio `_factor / 10^_decimals` to all holders.
     * @dev Snapshots decimals, ABAF and total supply, rebases the ERC20 total supply and decimals,
     *      scales the max-supply cap, multiplies the global ABAF and emits AdjustmentBalanceSet.
     * @param _factor   Numerator of the multiplier.
     * @param _decimals Denominator exponent.
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
     * @notice Lazily rebases `_partition`'s total supply and max supply to the current ABAF.
     * @dev Computes the catch-up factor between the partition's LABAF and the global ABAF; exits
     *      early when no adjustment is outstanding.
     * @param _partition Partition identifier whose totals are synchronised.
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
     * @notice Returns the LABAF stored for `_account`, defaulting unset values to one.
     * @param _account Account whose account-level LABAF is read.
     * @return Non-zero LABAF value safe to divide by.
     */
    function getLabafByUser(address _account) internal view returns (uint256) {
        return zeroToOne(adjustBalancesStorage().labaf[_account]);
    }

    /**
     * @notice Returns the LABAF stored for `_partition`, defaulting unset values to one.
     * @param _partition Partition whose LABAF is read.
     * @return Non-zero LABAF value safe to divide by.
     */
    function getLabafByPartition(bytes32 _partition) internal view returns (uint256) {
        return zeroToOne(adjustBalancesStorage().labafByPartition[_partition]);
    }

    /**
     * @notice Returns `_account`'s LABAF for `_partition`.
     * @dev Resolves the holder's partition index then delegates to `getLabafByUserAndPartitionIndex`.
     * @param _partition Partition identifier.
     * @param _account   Holder whose partition LABAF is read.
     * @return Non-zero LABAF value safe to divide by.
     */
    function getLabafByUserAndPartition(bytes32 _partition, address _account) internal view returns (uint256) {
        return
            getLabafByUserAndPartitionIndex(
                ERC1410StorageWrapper.erc1410BasicStorage().partitionToIndex[_account][_partition],
                _account
            );
    }

    /**
     * @notice Returns the LABAF stored at `_partitionIndex` for `_account`.
     * @dev `_partitionIndex` is 1-based; an index of zero (partition not held) yields a neutral 1.
     * @param _partitionIndex 1-based partition position in the holder's list.
     * @param _account        Holder whose entry is read.
     * @return Non-zero LABAF value safe to divide by.
     */
    function getLabafByUserAndPartitionIndex(
        uint256 _partitionIndex,
        address _account
    ) internal view returns (uint256) {
        return
            _partitionIndex == 0
                ? 1
                : zeroToOne(adjustBalancesStorage().labafUserPartition[_account][_partitionIndex - 1]);
    }

    /**
     * @notice Returns the LABAF stored for an `_owner`/`_spender` allowance pair.
     * @param _owner   Owner of the allowance.
     * @param _spender Address authorised to spend the allowance.
     * @return Non-zero LABAF value safe to divide by.
     */
    function getAllowanceLabaf(address _owner, address _spender) internal view returns (uint256) {
        return zeroToOne(adjustBalancesStorage().labafsAllowances[_owner][_spender]);
    }

    /**
     * @notice Returns the LABAF tied to `_tokenHolder`'s aggregate locked amount.
     * @param _tokenHolder Account being queried.
     * @return Non-zero LABAF value safe to divide by.
     */
    function getTotalLockLabaf(address _tokenHolder) internal view returns (uint256) {
        return zeroToOne(adjustBalancesStorage().labafLockedAmountByAccount[_tokenHolder]);
    }

    /**
     * @notice Returns the LABAF tied to `_tokenHolder`'s partition-level locked total.
     * @param _partition   Partition concerned.
     * @param _tokenHolder Account being queried.
     * @return Non-zero LABAF value safe to divide by.
     */
    function getTotalLockLabafByPartition(bytes32 _partition, address _tokenHolder) internal view returns (uint256) {
        return zeroToOne(adjustBalancesStorage().labafLockedAmountByAccountAndPartition[_tokenHolder][_partition]);
    }

    /**
     * @notice Returns the LABAF associated with a specific lock identifier.
     * @param _partition   Partition the lock belongs to.
     * @param _tokenHolder Account owning the lock.
     * @param _lockId      Identifier of the lock.
     * @return Non-zero LABAF value safe to divide by.
     */
    function getLockLabafById(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _lockId
    ) internal view returns (uint256) {
        return
            zeroToOne(
                adjustBalancesStorage().labafLockedAmountByAccountPartitionAndId[_tokenHolder][_partition][_lockId]
            );
    }

    /**
     * @notice Returns the LABAF tied to `_tokenHolder`'s aggregate held amount.
     * @param _tokenHolder Account being queried.
     * @return Non-zero LABAF value safe to divide by.
     */
    function getTotalHeldLabaf(address _tokenHolder) internal view returns (uint256) {
        return zeroToOne(adjustBalancesStorage().labafHeldAmountByAccount[_tokenHolder]);
    }

    /**
     * @notice Returns the LABAF tied to `_tokenHolder`'s partition-level held total.
     * @param _partition   Partition concerned.
     * @param _tokenHolder Account being queried.
     * @return Non-zero LABAF value safe to divide by.
     */
    function getTotalHeldLabafByPartition(bytes32 _partition, address _tokenHolder) internal view returns (uint256) {
        return zeroToOne(adjustBalancesStorage().labafHeldAmountByAccountAndPartition[_tokenHolder][_partition]);
    }

    /**
     * @notice Returns the LABAF associated with a specific hold identifier.
     * @param _partition   Partition the hold belongs to.
     * @param _tokenHolder Account owning the hold.
     * @param _holdId      Identifier of the hold.
     * @return Non-zero LABAF value safe to divide by.
     */
    function getHoldLabafById(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _holdId
    ) internal view returns (uint256) {
        return
            zeroToOne(
                adjustBalancesStorage().labafHeldAmountByAccountPartitionAndId[_tokenHolder][_partition][_holdId]
            );
    }

    /**
     * @notice Returns the LABAF tied to `_tokenHolder`'s aggregate frozen amount.
     * @param _tokenHolder Account being queried.
     * @return Non-zero LABAF value safe to divide by.
     */
    function getTotalFrozenLabaf(address _tokenHolder) internal view returns (uint256) {
        return zeroToOne(adjustBalancesStorage().labafFrozenAmountByAccount[_tokenHolder]);
    }

    /**
     * @notice Returns the LABAF tied to `_tokenHolder`'s partition-level frozen total.
     * @param _partition   Partition concerned.
     * @param _tokenHolder Account being queried.
     * @return Non-zero LABAF value safe to divide by.
     */
    function getTotalFrozenLabafByPartition(bytes32 _partition, address _tokenHolder) internal view returns (uint256) {
        return zeroToOne(adjustBalancesStorage().labafFrozenAmountByAccountAndPartition[_tokenHolder][_partition]);
    }

    /**
     * @notice Returns the LABAF tied to `_tokenHolder`'s aggregate cleared amount.
     * @param _tokenHolder Account being queried.
     * @return Non-zero LABAF value safe to divide by.
     */
    function getTotalClearedLabaf(address _tokenHolder) internal view returns (uint256) {
        return zeroToOne(adjustBalancesStorage().labafClearedAmountByAccount[_tokenHolder]);
    }

    /**
     * @notice Returns the LABAF tied to `_tokenHolder`'s partition-level cleared total.
     * @param _partition   Partition concerned.
     * @param _tokenHolder Account being queried.
     * @return Non-zero LABAF value safe to divide by.
     */
    function getTotalClearedLabafByPartition(bytes32 _partition, address _tokenHolder) internal view returns (uint256) {
        return zeroToOne(adjustBalancesStorage().labafClearedAmountByAccountAndPartition[_tokenHolder][_partition]);
    }

    /**
     * @notice Returns the LABAF associated with a specific clearing operation.
     * @param _clearingOperationIdentifier Tuple identifying the clearing entry.
     * @return Non-zero LABAF value safe to divide by.
     */
    function getClearingLabafById(
        IClearingTypes.ClearingOperationIdentifier memory _clearingOperationIdentifier
    ) internal view returns (uint256) {
        return
            zeroToOne(
                adjustBalancesStorage().labafClearedAmountByAccountPartitionTypeAndId[
                    _clearingOperationIdentifier.tokenHolder
                ][_clearingOperationIdentifier.partition][_clearingOperationIdentifier.clearingOperationType][
                        _clearingOperationIdentifier.clearingId
                    ]
            );
    }

    /**
     * @notice Catch-up factor between `abaf` and `tokenHolder`'s account-level LABAF.
     * @param abaf        Aggregate balance adjustment factor used as dividend.
     * @param tokenHolder Account whose LABAF is used as divisor.
     * @return factor     Catch-up multiplier to apply to the holder's stored balance.
     */
    function calculateFactorByAbafAndTokenHolder(
        uint256 abaf,
        address tokenHolder
    ) internal view returns (uint256 factor) {
        factor = calculateFactor(abaf, getLabafByUser(tokenHolder));
    }

    /**
     * @notice Catch-up factor between `abaf` and `tokenHolder`'s partition-level LABAF.
     * @param abaf           Aggregate balance adjustment factor used as dividend.
     * @param tokenHolder    Account whose partition LABAF is used.
     * @param partitionIndex 1-based partition position in the holder's list.
     * @return factor        Catch-up multiplier to apply to the holder's partition balance.
     */
    function calculateFactorByTokenHolderAndPartitionIndex(
        uint256 abaf,
        address tokenHolder,
        uint256 partitionIndex
    ) internal view returns (uint256 factor) {
        factor = calculateFactor(abaf, getLabafByUserAndPartitionIndex(partitionIndex, tokenHolder));
    }

    /**
     * @notice Catch-up factor for `tokenHolder`'s locked amount versus the ABAF at `timestamp`.
     * @dev Projected ABAF includes pending scheduled adjustments due by `timestamp`.
     * @param tokenHolder Account being queried.
     * @param timestamp   Point in time at which the ABAF is evaluated.
     * @return factor     Catch-up multiplier for the holder's locked amount.
     */
    function calculateFactorForLockedAmountByTokenHolderAdjustedAt(
        address tokenHolder,
        uint256 timestamp
    ) internal view returns (uint256 factor) {
        factor = calculateFactor(getAbafAdjustedAt(timestamp), getTotalLockLabaf(tokenHolder));
    }

    /**
     * @notice Catch-up factor for `tokenHolder`'s frozen amount versus the ABAF at `timestamp`.
     * @dev Projected ABAF includes pending scheduled adjustments due by `timestamp`.
     * @param tokenHolder Account being queried.
     * @param timestamp   Point in time at which the ABAF is evaluated.
     * @return factor     Catch-up multiplier for the holder's frozen amount.
     */
    function calculateFactorForFrozenAmountByTokenHolderAdjustedAt(
        address tokenHolder,
        uint256 timestamp
    ) internal view returns (uint256 factor) {
        factor = calculateFactor(getAbafAdjustedAt(timestamp), getTotalFrozenLabaf(tokenHolder));
    }

    /**
     * @notice Catch-up factor for `tokenHolder`'s held amount versus the ABAF at `timestamp`.
     * @dev Projected ABAF includes pending scheduled adjustments due by `timestamp`.
     * @param tokenHolder Account being queried.
     * @param timestamp   Point in time at which the ABAF is evaluated.
     * @return factor     Catch-up multiplier for the holder's held amount.
     */
    function calculateFactorForHeldAmountByTokenHolderAdjustedAt(
        address tokenHolder,
        uint256 timestamp
    ) internal view returns (uint256 factor) {
        factor = calculateFactor(getAbafAdjustedAt(timestamp), getTotalHeldLabaf(tokenHolder));
    }

    /**
     * @notice Catch-up factor for `tokenHolder`'s cleared amount versus the ABAF at `timestamp`.
     * @dev Projected ABAF includes pending scheduled adjustments due by `timestamp`.
     * @param tokenHolder Account being queried.
     * @param timestamp   Point in time at which the ABAF is evaluated.
     * @return factor     Catch-up multiplier for the holder's cleared amount.
     */
    function calculateFactorForClearedAmountByTokenHolderAdjustedAt(
        address tokenHolder,
        uint256 timestamp
    ) internal view returns (uint256 factor) {
        factor = calculateFactor(getAbafAdjustedAt(timestamp), getTotalClearedLabaf(tokenHolder));
    }

    /**
     * @notice Total supply projected to the ABAF effective at `_timestamp`.
     * @dev Multiplies the raw ERC1410 total supply by the cumulative pending ABAF at `_timestamp`.
     * @param _timestamp Point in time to project to.
     * @return Adjusted total supply.
     */
    function totalSupplyAdjustedAt(uint256 _timestamp) internal view returns (uint256) {
        (uint256 pendingABAF, ) = getPendingScheduledBalanceAdjustmentsAt(_timestamp);
        return ERC1410StorageWrapper.totalSupply() * pendingABAF;
    }

    /**
     * @notice Partition total supply projected to the ABAF effective at `_timestamp`.
     * @param _partition Partition identifier.
     * @param _timestamp Point in time to project to.
     * @return Adjusted partition total supply.
     */
    function totalSupplyByPartitionAdjustedAt(bytes32 _partition, uint256 _timestamp) internal view returns (uint256) {
        return
            ERC1410StorageWrapper.totalSupplyByPartition(_partition) *
            calculateFactor(getAbafAdjustedAt(_timestamp), getLabafByPartition(_partition));
    }

    /**
     * @notice `_tokenHolder`'s balance projected to the ABAF effective at `_timestamp`.
     * @param _tokenHolder Account being queried.
     * @param _timestamp   Point in time to project to.
     * @return Adjusted balance.
     */
    function balanceOfAdjustedAt(address _tokenHolder, uint256 _timestamp) internal view returns (uint256) {
        return
            ERC1410StorageWrapper.balanceOf(_tokenHolder) *
            calculateFactor(getAbafAdjustedAt(_timestamp), getLabafByUser(_tokenHolder));
    }

    /**
     * @notice `_tokenHolder`'s partition balance projected to the ABAF effective at `_timestamp`.
     * @param _partition   Partition identifier.
     * @param _tokenHolder Account being queried.
     * @param _timestamp   Point in time to project to.
     * @return Adjusted partition balance.
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
     * @notice Cumulative ABAF and decimal shift implied by scheduled adjustments due by `_timestamp`.
     * @dev Delegates to `ScheduledTasksStorageWrapper`; result is multiplicative for the ABAF and
     *      additive for the decimals component.
     * @param _timestamp        Point in time to project forwards to.
     * @return pendingAbaf_     Product of factors of all due scheduled adjustments.
     * @return pendingDecimals_ Sum of decimal exponents of all due scheduled adjustments.
     */
    function getPendingScheduledBalanceAdjustmentsAt(
        uint256 _timestamp
    ) internal view returns (uint256 pendingAbaf_, uint8 pendingDecimals_) {
        return ScheduledTasksStorageWrapper.getPendingScheduledBalanceAdjustmentsAt(_timestamp);
    }

    /**
     * @notice Returns the current ABAF, substituting one when storage is uninitialised.
     * @return Non-zero ABAF value safe to divide by.
     */
    function getAbaf() internal view returns (uint256) {
        return zeroToOne(adjustBalancesStorage().abaf);
    }

    /**
     * @notice ABAF projected to `_timestamp` by folding in pending scheduled adjustments.
     * @param _timestamp Point in time to project to.
     * @return Projected ABAF.
     */
    function getAbafAdjustedAt(uint256 _timestamp) internal view returns (uint256) {
        (uint256 pendingAbaf, ) = getPendingScheduledBalanceAdjustmentsAt(_timestamp);
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
        (uint256 pendingAbaf, uint8 pendingDecimals) = getPendingScheduledBalanceAdjustmentsAt(MAX_UINT256);

        uint256 totalSupply = zeroToOne(ERC20StorageWrapper.totalSupply()) * pendingAbaf;
        uint256 abaf = getAbaf() * pendingAbaf;
        uint8 decimals = ERC20StorageWrapper.decimals() + pendingDecimals;

        if (MAX_UINT8 - decimals < _decimals) revert IAdjustBalances.DecimalsOverflow();
        if (MAX_UINT256 / abaf < _factor) revert IAdjustBalances.FactorOverflow();
        if (MAX_UINT256 / totalSupply < _factor) revert IAdjustBalances.TotalSupplyOverflow();
    }

    /**
     * @notice Computes `_abaf / _labaf`, the catch-up multiplier from a stored LABAF to a target ABAF.
     * @dev Integer division: callers must ensure `_abaf` is a multiple of `_labaf` to avoid truncation.
     * @param _abaf    Aggregate balance adjustment factor (dividend).
     * @param _labaf   Last observed adjustment factor (divisor).
     * @return factor_ Catch-up multiplier.
     */
    function calculateFactor(uint256 _abaf, uint256 _labaf) internal pure returns (uint256 factor_) {
        factor_ = _abaf / _labaf;
    }

    /**
     * @notice Returns `_input` when non-zero, otherwise one.
     * @dev Used to guard divisions against uninitialised LABAF/ABAF storage values.
     * @param _input Candidate value.
     * @return One when `_input` is zero; the input unchanged otherwise.
     */
    function zeroToOne(uint256 _input) internal pure returns (uint256) {
        return _input == 0 ? 1 : _input;
    }

    /**
     * @notice Reverts with `IAdjustBalances.FactorIsZero` when `_factor` is zero.
     * @param _factor Factor being validated.
     */
    function checkValidFactor(uint256 _factor) internal pure {
        if (_factor == 0) revert IAdjustBalances.FactorIsZero();
    }

    /**
     * @notice Returns the diamond storage struct anchored at the AdjustBalances storage slot.
     * @dev Uses inline assembly to pin the struct to `_ADJUST_BALANCES_STORAGE_POSITION` regardless
     *      of contract layout, following the ERC-2535 unstructured-storage pattern.
     * @return adjustBalancesStorage_ Reference to the storage struct.
     */
    function adjustBalancesStorage() internal pure returns (AdjustBalancesStorage storage adjustBalancesStorage_) {
        bytes32 position = _ADJUST_BALANCES_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            adjustBalancesStorage_.slot := position
        }
    }
}
