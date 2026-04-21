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
import { IAdjustBalances } from "../../facets/layer_2/adjustBalance/IAdjustBalances.sol";

/**
 * @notice Stores and manages balance adjustment factors and related per-account tracking data.
 * @dev Uses a dedicated storage slot to isolate adjustment state across facets and libraries.
 *      Coordinates supply, balance, lock, hold, freeze, and clearing adjustments, and relies on
 *      other storage wrappers for partition and scheduled-task state.
 * @author Hashgraph
 */
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

/// @title AdjustBalancesStorageWrapper
/// @notice Provides storage accessors and balance-adjustment helpers for asset state.
/// @dev Encapsulates all reads and writes to the adjustment storage slot, and coordinates
///      proportional supply and balance updates across ERC20, ERC1410, cap, snapshot, and
///      scheduled-task storage. Factor calculations are intentionally centralised to preserve
///      invariants across balance-related features.
/// @author Hashgraph
library AdjustBalancesStorageWrapper {
    /**
     * @notice Updates the global adjustment factor by multiplying the current value.
     * @dev Used when a balance adjustment is applied. The caller is responsible for ensuring
     *      the factor is valid for the intended rebasing operation.
     * @param factor Multiplicative factor applied to the current adjustment value.
     */
    function updateAbaf(uint256 factor) internal {
        adjustBalancesStorage().abaf = getAbaf() * factor;
    }

    /**
     * @notice Stores a per-account adjustment factor.
     * @dev Overwrites the current factor for the token holder.
     * @param labaf New factor to associate with the token holder.
     * @param tokenHolder Account whose factor is updated.
     */
    function updateLabafByTokenHolder(uint256 labaf, address tokenHolder) internal {
        adjustBalancesStorage().labaf[tokenHolder] = labaf;
    }

    /**
     * @notice Stores the global factor for a partition.
     * @dev Mirrors the current global adjustment factor into partition-specific state.
     * @param partition Partition identifier to update.
     */
    function updateLabafByPartition(bytes32 partition) internal {
        adjustBalancesStorage().labafByPartition[partition] = getAbaf();
    }

    /**
     * @notice Appends a partition factor entry for an account.
     * @dev Maintains the per-account partition ordering used by indexed lookups.
     * @param _tokenHolder Account whose partition list is extended.
     * @param _labaf Factor value to append.
     */
    function pushLabafUserPartition(address _tokenHolder, uint256 _labaf) internal {
        adjustBalancesStorage().labafUserPartition[_tokenHolder].push(_labaf);
    }

    /**
     * @notice Updates a stored per-account partition factor by index.
     * @dev Expects a one-based partition index and writes to the underlying zero-based array.
     * @param labaf Factor value to store.
     * @param tokenHolder Account whose partition entry is updated.
     * @param partitionIndex One-based partition index.
     */
    function updateLabafByTokenHolderAndPartitionIndex(
        uint256 labaf,
        address tokenHolder,
        uint256 partitionIndex
    ) internal {
        adjustBalancesStorage().labafUserPartition[tokenHolder][partitionIndex - 1] = labaf;
    }

    /**
     * @notice Stores an allowance factor between an owner and spender.
     * @dev Used by allowance-based balance adjustment logic.
     * @param _owner Allowance owner.
     * @param _spender Allowance spender.
     * @param _labaf Factor value to store.
     */
    function updateAllowanceLabaf(address _owner, address _spender, uint256 _labaf) internal {
        adjustBalancesStorage().labafsAllowances[_owner][_spender] = _labaf;
    }

    /**
     * @notice Stores a lock factor for a specific lock identifier.
     * @dev Overwrites the lock entry for the given partition, holder, and lock id.
     * @param _partition Partition associated with the lock.
     * @param _tokenHolder Locked account.
     * @param _lockId Lock identifier.
     * @param _labaf Factor value to store.
     */
    function setLockLabafById(bytes32 _partition, address _tokenHolder, uint256 _lockId, uint256 _labaf) internal {
        adjustBalancesStorage().labafLockedAmountByAccountPartitionAndId[_tokenHolder][_partition][_lockId] = _labaf;
    }

    /**
     * @notice Stores the total locked factor for an account.
     * @dev Represents the aggregate lock state across all partitions.
     * @param _tokenHolder Locked account.
     * @param _labaf Total locked factor.
     */
    function setTotalLockLabaf(address _tokenHolder, uint256 _labaf) internal {
        adjustBalancesStorage().labafLockedAmountByAccount[_tokenHolder] = _labaf;
    }

    /**
     * @notice Stores the locked factor for an account within a partition.
     * @dev Used when partition-specific lock state is tracked separately from the aggregate total.
     * @param _partition Partition associated with the lock.
     * @param _tokenHolder Locked account.
     * @param _labaf Locked factor to store.
     */
    function setTotalLockLabafByPartition(bytes32 _partition, address _tokenHolder, uint256 _labaf) internal {
        adjustBalancesStorage().labafLockedAmountByAccountAndPartition[_tokenHolder][_partition] = _labaf;
    }

    /**
     * @notice Removes a lock entry for the given identifier.
     * @dev Deletes the stored factor and leaves any aggregate totals to the caller.
     * @param _partition Partition associated with the lock.
     * @param _tokenHolder Locked account.
     * @param _lockId Lock identifier.
     */
    function removeLabafLock(bytes32 _partition, address _tokenHolder, uint256 _lockId) internal {
        delete adjustBalancesStorage().labafLockedAmountByAccountPartitionAndId[_tokenHolder][_partition][_lockId];
    }

    /**
     * @notice Stores a hold factor for a specific hold identifier.
     * @dev Overwrites the hold entry for the given partition, holder, and hold id.
     * @param _partition Partition associated with the hold.
     * @param _tokenHolder Held account.
     * @param _holdId Hold identifier.
     * @param _labaf Factor value to store.
     */
    function setHeldLabafById(bytes32 _partition, address _tokenHolder, uint256 _holdId, uint256 _labaf) internal {
        adjustBalancesStorage().labafHeldAmountByAccountPartitionAndId[_tokenHolder][_partition][_holdId] = _labaf;
    }

    /**
     * @notice Stores the total held factor for an account.
     * @dev Represents the aggregate hold state across all partitions.
     * @param _tokenHolder Held account.
     * @param _labaf Total held factor.
     */
    function setTotalHeldLabaf(address _tokenHolder, uint256 _labaf) internal {
        adjustBalancesStorage().labafHeldAmountByAccount[_tokenHolder] = _labaf;
    }

    /**
     * @notice Stores the held factor for an account within a partition.
     * @dev Used when partition-specific hold state is tracked separately from the aggregate total.
     * @param _partition Partition associated with the hold.
     * @param _tokenHolder Held account.
     * @param _labaf Held factor to store.
     */
    function setTotalHeldLabafByPartition(bytes32 _partition, address _tokenHolder, uint256 _labaf) internal {
        adjustBalancesStorage().labafHeldAmountByAccountAndPartition[_tokenHolder][_partition] = _labaf;
    }

    /**
     * @notice Removes a hold entry for the given identifier.
     * @dev Deletes the stored factor and leaves any aggregate totals to the caller.
     * @param _partition Partition associated with the hold.
     * @param _tokenHolder Held account.
     * @param _holdId Hold identifier.
     */
    function removeLabafHold(bytes32 _partition, address _tokenHolder, uint256 _holdId) internal {
        delete adjustBalancesStorage().labafHeldAmountByAccountPartitionAndId[_tokenHolder][_partition][_holdId];
    }

    /**
     * @notice Stores the total frozen factor for an account.
     * @dev Represents the aggregate freeze state across all partitions.
     * @param _tokenHolder Frozen account.
     * @param _labaf Total frozen factor.
     */
    function setTotalFreezeLabaf(address _tokenHolder, uint256 _labaf) internal {
        adjustBalancesStorage().labafFrozenAmountByAccount[_tokenHolder] = _labaf;
    }

    /**
     * @notice Stores the frozen factor for an account within a partition.
     * @dev Used when partition-specific freeze state is tracked separately from the aggregate total.
     * @param _partition Partition associated with the freeze.
     * @param _tokenHolder Frozen account.
     * @param _labaf Frozen factor to store.
     */
    function setTotalFreezeLabafByPartition(bytes32 _partition, address _tokenHolder, uint256 _labaf) internal {
        adjustBalancesStorage().labafFrozenAmountByAccountAndPartition[_tokenHolder][_partition] = _labaf;
    }

    /**
     * @notice Stores a cleared factor for a clearing operation.
     * @dev Keys the value by account, partition, operation type, and clearing identifier.
     * @param _clearingOperationIdentifier Clearing operation identity.
     * @param _labaf Cleared factor to store.
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
     * @notice Stores the total cleared factor for an account.
     * @dev Represents the aggregate cleared amount across all partitions.
     * @param _tokenHolder Cleared account.
     * @param _labaf Total cleared factor.
     */
    function setTotalClearedLabaf(address _tokenHolder, uint256 _labaf) internal {
        adjustBalancesStorage().labafClearedAmountByAccount[_tokenHolder] = _labaf;
    }

    /**
     * @notice Stores the cleared factor for an account within a partition.
     * @dev Used when partition-specific clearing state is tracked separately from the aggregate total.
     * @param _partition Partition associated with the clearing state.
     * @param _tokenHolder Cleared account.
     * @param _labaf Cleared factor to store.
     */
    function setTotalClearedLabafByPartition(bytes32 _partition, address _tokenHolder, uint256 _labaf) internal {
        adjustBalancesStorage().labafClearedAmountByAccountAndPartition[_tokenHolder][_partition] = _labaf;
    }

    /**
     * @notice Removes a clearing entry for the given clearing operation.
     * @dev Deletes the stored factor and leaves any aggregate totals to the caller.
     * @param _clearingOperationIdentifier Clearing operation identity.
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
     * @notice Applies a balance adjustment across supply, decimals, and cap state.
     * @dev Updates snapshots before mutating live state and emits an adjustment event. The caller
     *      must ensure the factor and decimals are consistent with the intended rebasing operation.
     * @param _factor Multiplicative adjustment factor.
     * @param _decimals New decimals value to apply.
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
     * @notice Adjusts total supply and cap for a partition when its factor differs from the global factor.
     * @dev Returns early when no update is required. The caller must ensure the partition is valid
     *      for the asset being adjusted.
     * @param _partition Partition to update.
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
     * @notice Returns the effective factor for an account.
     * @dev Returns one when the stored value is zero to preserve neutral multiplication semantics.
     * @param _account Account whose factor is queried.
     * @return Effective account factor.
     */
    function getLabafByUser(address _account) internal view returns (uint256) {
        return zeroToOne(adjustBalancesStorage().labaf[_account]);
    }

    /**
     * @notice Returns the effective factor for a partition.
     * @dev Returns one when the stored value is zero to preserve neutral multiplication semantics.
     * @param _partition Partition whose factor is queried.
     * @return Effective partition factor.
     */
    function getLabafByPartition(bytes32 _partition) internal view returns (uint256) {
        return zeroToOne(adjustBalancesStorage().labafByPartition[_partition]);
    }

    /**
     * @notice Returns the effective factor for an account within a partition.
     * @dev Derives the partition index from ERC1410 storage and falls back to one if the account
     *      has no partition entry.
     * @param _partition Partition whose factor is queried.
     * @param _account Account whose factor is queried.
     * @return Effective account-partition factor.
     */
    function getLabafByUserAndPartition(bytes32 _partition, address _account) internal view returns (uint256) {
        return
            getLabafByUserAndPartitionIndex(ERC1410StorageWrapper.getPartitionToIndex(_account, _partition), _account);
    }

    /**
     * @notice Returns the effective factor for an account using a partition index.
     * @dev Returns one for an uninitialised index to avoid division by zero in downstream math.
     * @param _partitionIndex One-based partition index.
     * @param _account Account whose factor is queried.
     * @return Effective account-partition factor.
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
     * @notice Returns the effective allowance factor between two accounts.
     * @dev Returns one when the stored value is zero to preserve neutral multiplication semantics.
     * @param _owner Allowance owner.
     * @param _spender Allowance spender.
     * @return Effective allowance factor.
     */
    function getAllowanceLabaf(address _owner, address _spender) internal view returns (uint256) {
        return zeroToOne(adjustBalancesStorage().labafsAllowances[_owner][_spender]);
    }

    /**
     * @notice Returns the total effective locked factor for an account.
     * @dev Returns one when no lock value is stored.
     * @param _tokenHolder Locked account.
     * @return Effective total locked factor.
     */
    function getTotalLockLabaf(address _tokenHolder) internal view returns (uint256) {
        return zeroToOne(adjustBalancesStorage().labafLockedAmountByAccount[_tokenHolder]);
    }

    /**
     * @notice Returns the effective locked factor for an account within a partition.
     * @dev Returns one when no partition-specific lock value is stored.
     * @param _partition Partition associated with the lock.
     * @param _tokenHolder Locked account.
     * @return Effective partition locked factor.
     */
    function getTotalLockLabafByPartition(bytes32 _partition, address _tokenHolder) internal view returns (uint256) {
        return zeroToOne(adjustBalancesStorage().labafLockedAmountByAccountAndPartition[_tokenHolder][_partition]);
    }

    /**
     * @notice Returns the effective lock factor for a lock identifier.
     * @dev Returns one when no lock value is stored.
     * @param _partition Partition associated with the lock.
     * @param _tokenHolder Locked account.
     * @param _lockId Lock identifier.
     * @return Effective lock factor.
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
     * @notice Returns the total effective held factor for an account.
     * @dev Returns one when no hold value is stored.
     * @param _tokenHolder Held account.
     * @return Effective total held factor.
     */
    function getTotalHeldLabaf(address _tokenHolder) internal view returns (uint256) {
        return zeroToOne(adjustBalancesStorage().labafHeldAmountByAccount[_tokenHolder]);
    }

    /**
     * @notice Returns the effective held factor for an account within a partition.
     * @dev Returns one when no partition-specific hold value is stored.
     * @param _partition Partition associated with the hold.
     * @param _tokenHolder Held account.
     * @return Effective partition held factor.
     */
    function getTotalHeldLabafByPartition(bytes32 _partition, address _tokenHolder) internal view returns (uint256) {
        return zeroToOne(adjustBalancesStorage().labafHeldAmountByAccountAndPartition[_tokenHolder][_partition]);
    }

    /**
     * @notice Returns the effective hold factor for a hold identifier.
     * @dev Returns one when no hold value is stored.
     * @param _partition Partition associated with the hold.
     * @param _tokenHolder Held account.
     * @param _holdId Hold identifier.
     * @return Effective hold factor.
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
     * @notice Returns the total effective frozen factor for an account.
     * @dev Returns one when no freeze value is stored.
     * @param _tokenHolder Frozen account.
     * @return Effective total frozen factor.
     */
    function getTotalFrozenLabaf(address _tokenHolder) internal view returns (uint256) {
        return zeroToOne(adjustBalancesStorage().labafFrozenAmountByAccount[_tokenHolder]);
    }

    /**
     * @notice Returns the effective frozen factor for an account within a partition.
     * @dev Returns one when no partition-specific freeze value is stored.
     * @param _partition Partition associated with the freeze.
     * @param _tokenHolder Frozen account.
     * @return Effective partition frozen factor.
     */
    function getTotalFrozenLabafByPartition(bytes32 _partition, address _tokenHolder) internal view returns (uint256) {
        return zeroToOne(adjustBalancesStorage().labafFrozenAmountByAccountAndPartition[_tokenHolder][_partition]);
    }

    /**
     * @notice Returns the total effective cleared factor for an account.
     * @dev Returns one when no cleared value is stored.
     * @param _tokenHolder Cleared account.
     * @return Effective total cleared factor.
     */
    function getTotalClearedLabaf(address _tokenHolder) internal view returns (uint256) {
        return zeroToOne(adjustBalancesStorage().labafClearedAmountByAccount[_tokenHolder]);
    }

    /**
     * @notice Returns the effective cleared factor for an account within a partition.
     * @dev Returns one when no partition-specific cleared value is stored.
     * @param _partition Partition associated with the clearing state.
     * @param _tokenHolder Cleared account.
     * @return Effective partition cleared factor.
     */
    function getTotalClearedLabafByPartition(bytes32 _partition, address _tokenHolder) internal view returns (uint256) {
        return zeroToOne(adjustBalancesStorage().labafClearedAmountByAccountAndPartition[_tokenHolder][_partition]);
    }

    /**
     * @notice Returns the effective cleared factor for a clearing operation.
     * @dev Uses the full clearing identifier to disambiguate multiple operations on the same
     *      account and partition.
     * @param _clearingOperationIdentifier Clearing operation identity.
     * @return Effective cleared factor for the operation.
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
     * @notice Calculates the adjustment factor for an account against the global factor.
     * @dev Performs a division-based factor derivation using the current stored account factor.
     * @param abaf Global adjustment factor.
     * @param tokenHolder Account whose factor is used.
     * @return factor Derived factor for the account.
     */
    function calculateFactorByAbafAndTokenHolder(
        uint256 abaf,
        address tokenHolder
    ) internal view returns (uint256 factor) {
        factor = calculateFactor(abaf, getLabafByUser(tokenHolder));
    }

    /**
     * @notice Calculates the adjustment factor for an account partition index against the global factor.
     * @dev Uses the partition-index lookup to derive the denominator.
     * @param abaf Global adjustment factor.
     * @param tokenHolder Account whose factor is used.
     * @param partitionIndex One-based partition index.
     * @return factor Derived factor for the account partition.
     */
    function calculateFactorByTokenHolderAndPartitionIndex(
        uint256 abaf,
        address tokenHolder,
        uint256 partitionIndex
    ) internal view returns (uint256 factor) {
        factor = calculateFactor(abaf, getLabafByUserAndPartitionIndex(partitionIndex, tokenHolder));
    }

    /**
     * @notice Calculates the adjustment factor for locked balances at a given timestamp.
     * @dev Uses the scheduled adjustment state that applies at the provided timestamp.
     * @param tokenHolder Locked account.
     * @param timestamp Timestamp used for scheduled adjustment lookup.
     * @return factor Derived locked-balance factor.
     */
    function calculateFactorForLockedAmountByTokenHolderAdjustedAt(
        address tokenHolder,
        uint256 timestamp
    ) internal view returns (uint256 factor) {
        factor = calculateFactor(getAbafAdjustedAt(timestamp), getTotalLockLabaf(tokenHolder));
    }

    /**
     * @notice Calculates the adjustment factor for frozen balances at a given timestamp.
     * @dev Uses the scheduled adjustment state that applies at the provided timestamp.
     * @param tokenHolder Frozen account.
     * @param timestamp Timestamp used for scheduled adjustment lookup.
     * @return factor Derived frozen-balance factor.
     */
    function calculateFactorForFrozenAmountByTokenHolderAdjustedAt(
        address tokenHolder,
        uint256 timestamp
    ) internal view returns (uint256 factor) {
        factor = calculateFactor(getAbafAdjustedAt(timestamp), getTotalFrozenLabaf(tokenHolder));
    }

    /**
     * @notice Calculates the adjustment factor for held balances at a given timestamp.
     * @dev Uses the scheduled adjustment state that applies at the provided timestamp.
     * @param tokenHolder Held account.
     * @param timestamp Timestamp used for scheduled adjustment lookup.
     * @return factor Derived held-balance factor.
     */
    function calculateFactorForHeldAmountByTokenHolderAdjustedAt(
        address tokenHolder,
        uint256 timestamp
    ) internal view returns (uint256 factor) {
        factor = calculateFactor(getAbafAdjustedAt(timestamp), getTotalHeldLabaf(tokenHolder));
    }

    /**
     * @notice Calculates the adjustment factor for cleared balances at a given timestamp.
     * @dev Uses the scheduled adjustment state that applies at the provided timestamp.
     * @param tokenHolder Cleared account.
     * @param timestamp Timestamp used for scheduled adjustment lookup.
     * @return factor Derived cleared-balance factor.
     */
    function calculateFactorForClearedAmountByTokenHolderAdjustedAt(
        address tokenHolder,
        uint256 timestamp
    ) internal view returns (uint256 factor) {
        factor = calculateFactor(getAbafAdjustedAt(timestamp), getTotalClearedLabaf(tokenHolder));
    }

    /**
     * @notice Returns the total supply adjusted for scheduled balance changes at a timestamp.
     * @dev Uses the pending scheduled adjustment factor only; does not mutate state.
     * @param _timestamp Timestamp used for scheduled adjustment lookup.
     * @return Adjusted total supply at the timestamp.
     */
    function totalSupplyAdjustedAt(uint256 _timestamp) internal view returns (uint256) {
        (uint256 pendingABAF, ) = getPendingScheduledBalanceAdjustmentsAt(_timestamp);
        return ERC20StorageWrapper.totalSupply() * pendingABAF;
    }

    /**
     * @notice Returns the partition total supply adjusted for scheduled balance changes.
     * @dev Applies the current partition factor against the scheduled global factor.
     * @param _partition Partition whose total supply is queried.
     * @param _timestamp Timestamp used for scheduled adjustment lookup.
     * @return Adjusted partition total supply at the timestamp.
     */
    function totalSupplyByPartitionAdjustedAt(bytes32 _partition, uint256 _timestamp) internal view returns (uint256) {
        return
            ERC1410StorageWrapper.totalSupplyByPartition(_partition) *
            calculateFactor(getAbafAdjustedAt(_timestamp), getLabafByPartition(_partition));
    }

    /**
     * @notice Returns an account balance adjusted for scheduled balance changes.
     * @dev Applies the current account factor against the scheduled global factor.
     * @param _tokenHolder Account whose balance is queried.
     * @param _timestamp Timestamp used for scheduled adjustment lookup.
     * @return Adjusted account balance at the timestamp.
     */
    function balanceOfAdjustedAt(address _tokenHolder, uint256 _timestamp) internal view returns (uint256) {
        return
            ERC20StorageWrapper.balanceOf(_tokenHolder) *
            calculateFactor(getAbafAdjustedAt(_timestamp), getLabafByUser(_tokenHolder));
    }

    /**
     * @notice Returns a partition balance adjusted for scheduled balance changes.
     * @dev Applies the current account-partition factor against the scheduled global factor.
     * @param _partition Partition whose balance is queried.
     * @param _tokenHolder Account whose balance is queried.
     * @param _timestamp Timestamp used for scheduled adjustment lookup.
     * @return Adjusted partition balance at the timestamp.
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
     * @notice Returns the pending scheduled balance adjustments at a timestamp.
     * @dev Delegates to scheduled-task storage and returns the next applicable global factor and
     *      decimal value.
     * @param _timestamp Timestamp used for scheduled adjustment lookup.
     * @return pendingAbaf_ Pending global adjustment factor.
     * @return pendingDecimals_ Pending decimals value.
     */
    function getPendingScheduledBalanceAdjustmentsAt(
        uint256 _timestamp
    ) internal view returns (uint256 pendingAbaf_, uint8 pendingDecimals_) {
        return ScheduledTasksStorageWrapper.getPendingScheduledBalanceAdjustmentsAt(_timestamp);
    }

    /**
     * @notice Returns the current global adjustment factor.
     * @dev Returns one when no factor is stored to preserve neutral multiplication semantics.
     * @return Current global adjustment factor.
     */
    function getAbaf() internal view returns (uint256) {
        return zeroToOne(adjustBalancesStorage().abaf);
    }

    /**
     * @notice Returns the global adjustment factor effective at a timestamp.
     * @dev Multiplies the current factor by the pending scheduled factor at the provided timestamp.
     * @param _timestamp Timestamp used for scheduled adjustment lookup.
     * @return Adjusted global factor at the timestamp.
     */
    function getAbafAdjustedAt(uint256 _timestamp) internal view returns (uint256) {
        (uint256 pendingAbaf, ) = getPendingScheduledBalanceAdjustmentsAt(_timestamp);
        return getAbaf() * pendingAbaf;
    }

    /**
     * @notice Calculates a division-based adjustment factor.
     * @dev Relies on the caller to provide a non-zero denominator.
     * @param _abaf Numerator factor.
     * @param _labaf Denominator factor.
     * @return factor_ Derived factor.
     */
    function calculateFactor(uint256 _abaf, uint256 _labaf) internal pure returns (uint256 factor_) {
        factor_ = _abaf / _labaf;
    }

    /**
     * @notice Normalises a zero value to one.
     * @dev Used to keep factor-based calculations neutral when state has not been initialised.
     * @param _input Value to normalise.
     * @return Normalised value.
     */
    function zeroToOne(uint256 _input) internal pure returns (uint256) {
        return _input == 0 ? 1 : _input;
    }

    /**
     * @notice Reverts when a calculated factor is zero.
     * @dev Intended as a guard for balance adjustment flows that must not produce a zero factor.
     * @param _factor Factor to validate.
     */
    function checkValidFactor(uint256 _factor) internal pure {
        if (_factor == 0) revert IAdjustBalances.FactorIsZero();
    }

    /**
     * @notice Returns the storage pointer for balance adjustment state.
     * @dev Uses the fixed storage position reserved for this wrapper.
     * @return adjustBalancesStorage_ Storage pointer for adjustment data.
     */
    function adjustBalancesStorage() private pure returns (AdjustBalancesStorage storage adjustBalancesStorage_) {
        bytes32 position = _ADJUST_BALANCES_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            adjustBalancesStorage_.slot := position
        }
    }
}
