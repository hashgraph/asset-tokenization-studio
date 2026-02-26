// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// solhint-disable ordering

import { adjustBalancesStorage } from "../../storage/ABAFStorageAccessor.sol";
import { LibERC1410 } from "./LibERC1410.sol";
import { LibCap } from "../core/LibCap.sol";
import { _SCHEDULED_BALANCE_ADJUSTMENTS_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import {
    ScheduledTask,
    ScheduledTasksDataStorage
} from "../../facets/assetCapabilities/interfaces/scheduledTasks/scheduledTasksCommon/IScheduledTasksCommon.sol";
import { IClearing } from "../../facets/features/interfaces/clearing/IClearing.sol";
import { IAdjustBalances } from "../../facets/assetCapabilities/interfaces/adjustBalances/IAdjustBalances.sol";
import { LibScheduledTasksStorage } from "./LibScheduledTasksStorage.sol";
import { IEquity } from "../../facets/assetCapabilities/interfaces/equity/IEquity.sol";
import { LibCorporateActions } from "../core/LibCorporateActions.sol";
import { LibScheduledTasks } from "./LibScheduledTasks.sol";

/// @title LibABAF
/// @notice Leaf library for ABAF (Aggregated Balance Adjustment Factor) and LABAF
/// (Last Aggregated Balance Adjustment Factor) management
/// @dev Extracted from AdjustBalancesStorageWrapper for library-based diamond migration
library LibABAF {
    // ═══════════════════════════════════════════════════════════════════════════════
    // CORE ABAF STATE
    // ═══════════════════════════════════════════════════════════════════════════════

    function updateAbaf(uint256 factor) internal {
        adjustBalancesStorage().abaf = getAbaf() * factor;
    }

    function getAbaf() internal view returns (uint256) {
        return _zeroToOne(adjustBalancesStorage().abaf);
    }

    function getAbafAdjustedAt(uint256 timestamp) internal view returns (uint256) {
        uint256 abaf = getAbaf();
        (uint256 pendingAbaf, ) = _getPendingScheduledBalanceAdjustmentsAt(timestamp);
        return abaf * pendingAbaf;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // PER-USER LABAF
    // ═══════════════════════════════════════════════════════════════════════════════

    function updateLabafByTokenHolder(uint256 labaf, address tokenHolder) internal {
        adjustBalancesStorage().labaf[tokenHolder] = labaf;
    }

    function pushLabafUserPartition(address tokenHolder, uint256 labaf) internal {
        adjustBalancesStorage().labafUserPartition[tokenHolder].push(labaf);
    }

    function updateLabafByTokenHolderAndPartitionIndex(
        uint256 labaf,
        address tokenHolder,
        uint256 partitionIndex
    ) internal {
        adjustBalancesStorage().labafUserPartition[tokenHolder][partitionIndex - 1] = labaf;
    }

    function getLabafByUser(address account) internal view returns (uint256) {
        return _zeroToOne(adjustBalancesStorage().labaf[account]);
    }

    function calculateFactorByAbafAndTokenHolder(uint256 abaf, address tokenHolder) internal view returns (uint256) {
        return calculateFactor(abaf, getLabafByUser(tokenHolder));
    }

    function calculateFactorByTokenHolderAndPartitionIndex(
        uint256 abaf,
        address tokenHolder,
        uint256 partitionIndex
    ) internal view returns (uint256) {
        return calculateFactor(abaf, getLabafByUserAndPartitionIndex(partitionIndex, tokenHolder));
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // PER-PARTITION LABAF
    // ═══════════════════════════════════════════════════════════════════════════════

    function getLabafByPartition(bytes32 partition) internal view returns (uint256) {
        return _zeroToOne(adjustBalancesStorage().labafByPartition[partition]);
    }

    function updateLabafByPartition(bytes32 partition) internal {
        adjustBalancesStorage().labafByPartition[partition] = getAbaf();
    }

    function getLabafByUserAndPartition(bytes32 partition, address account) internal view returns (uint256) {
        uint256 partitionsIndex = LibERC1410.getPartitionIndex(account, partition);
        if (partitionsIndex == 0) return 1;
        return _zeroToOne(adjustBalancesStorage().labafUserPartition[account][partitionsIndex - 1]);
    }

    function getLabafByUserAndPartitionIndex(uint256 partitionIndex, address account) internal view returns (uint256) {
        if (partitionIndex == 0) return 1;
        return _zeroToOne(adjustBalancesStorage().labafUserPartition[account][partitionIndex - 1]);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // ALLOWANCE LABAF
    // ═══════════════════════════════════════════════════════════════════════════════

    function getAllowanceLabaf(address owner, address spender) internal view returns (uint256) {
        return _zeroToOne(adjustBalancesStorage().labafsAllowances[owner][spender]);
    }

    function updateAllowanceLabaf(address owner, address spender, uint256 labaf) internal {
        adjustBalancesStorage().labafsAllowances[owner][spender] = labaf;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // LOCK LABAF
    // ═══════════════════════════════════════════════════════════════════════════════

    function getTotalLockLabaf(address tokenHolder) internal view returns (uint256) {
        return _zeroToOne(adjustBalancesStorage().labafLockedAmountByAccount[tokenHolder]);
    }

    function getTotalLockLabafByPartition(bytes32 partition, address tokenHolder) internal view returns (uint256) {
        return _zeroToOne(adjustBalancesStorage().labafLockedAmountByAccountAndPartition[tokenHolder][partition]);
    }

    function getLockLabafById(bytes32 partition, address tokenHolder, uint256 lockId) internal view returns (uint256) {
        return
            _zeroToOne(
                adjustBalancesStorage().labafLockedAmountByAccountPartitionAndId[tokenHolder][partition][lockId]
            );
    }

    function setTotalLockLabaf(address tokenHolder, uint256 labaf) internal {
        adjustBalancesStorage().labafLockedAmountByAccount[tokenHolder] = labaf;
    }

    function setTotalLockLabafByPartition(bytes32 partition, address tokenHolder, uint256 labaf) internal {
        adjustBalancesStorage().labafLockedAmountByAccountAndPartition[tokenHolder][partition] = labaf;
    }

    function setLockLabafById(bytes32 partition, address tokenHolder, uint256 lockId, uint256 labaf) internal {
        adjustBalancesStorage().labafLockedAmountByAccountPartitionAndId[tokenHolder][partition][lockId] = labaf;
    }

    function removeLabafLock(bytes32 partition, address tokenHolder, uint256 lockId) internal {
        delete adjustBalancesStorage().labafLockedAmountByAccountPartitionAndId[tokenHolder][partition][lockId];
    }

    function calculateFactorForLockedAmountAdjustedAt(
        address tokenHolder,
        uint256 timestamp
    ) internal view returns (uint256) {
        return calculateFactor(getAbafAdjustedAt(timestamp), getTotalLockLabaf(tokenHolder));
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // HOLD LABAF
    // ═══════════════════════════════════════════════════════════════════════════════

    function getTotalHeldLabaf(address tokenHolder) internal view returns (uint256) {
        return _zeroToOne(adjustBalancesStorage().labafHeldAmountByAccount[tokenHolder]);
    }

    function getTotalHeldLabafByPartition(bytes32 partition, address tokenHolder) internal view returns (uint256) {
        return _zeroToOne(adjustBalancesStorage().labafHeldAmountByAccountAndPartition[tokenHolder][partition]);
    }

    function getHeldLabafById(bytes32 partition, address tokenHolder, uint256 holdId) internal view returns (uint256) {
        return
            _zeroToOne(adjustBalancesStorage().labafHeldAmountByAccountPartitionAndId[tokenHolder][partition][holdId]);
    }

    function setTotalHeldLabaf(address tokenHolder, uint256 labaf) internal {
        adjustBalancesStorage().labafHeldAmountByAccount[tokenHolder] = labaf;
    }

    function setTotalHeldLabafByPartition(bytes32 partition, address tokenHolder, uint256 labaf) internal {
        adjustBalancesStorage().labafHeldAmountByAccountAndPartition[tokenHolder][partition] = labaf;
    }

    function setHeldLabafById(bytes32 partition, address tokenHolder, uint256 holdId, uint256 labaf) internal {
        adjustBalancesStorage().labafHeldAmountByAccountPartitionAndId[tokenHolder][partition][holdId] = labaf;
    }

    function removeLabafHold(bytes32 partition, address tokenHolder, uint256 holdId) internal {
        delete adjustBalancesStorage().labafHeldAmountByAccountPartitionAndId[tokenHolder][partition][holdId];
    }

    function calculateFactorForHeldAmountAdjustedAt(
        address tokenHolder,
        uint256 timestamp
    ) internal view returns (uint256) {
        return calculateFactor(getAbafAdjustedAt(timestamp), getTotalHeldLabaf(tokenHolder));
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // CLEARED LABAF
    // ═══════════════════════════════════════════════════════════════════════════════

    function getTotalClearedLabaf(address tokenHolder) internal view returns (uint256) {
        return _zeroToOne(adjustBalancesStorage().labafClearedAmountByAccount[tokenHolder]);
    }

    function getTotalClearedLabafByPartition(bytes32 partition, address tokenHolder) internal view returns (uint256) {
        return _zeroToOne(adjustBalancesStorage().labafClearedAmountByAccountAndPartition[tokenHolder][partition]);
    }

    function getClearingLabafById(IClearing.ClearingOperationIdentifier memory id) internal view returns (uint256) {
        return
            _zeroToOne(
                adjustBalancesStorage().labafClearedAmountByAccountPartitionTypeAndId[id.tokenHolder][id.partition][
                    id.clearingOperationType
                ][id.clearingId]
            );
    }

    function setTotalClearedLabaf(address tokenHolder, uint256 labaf) internal {
        adjustBalancesStorage().labafClearedAmountByAccount[tokenHolder] = labaf;
    }

    function setTotalClearedLabafByPartition(bytes32 partition, address tokenHolder, uint256 labaf) internal {
        adjustBalancesStorage().labafClearedAmountByAccountAndPartition[tokenHolder][partition] = labaf;
    }

    function setClearedLabafById(IClearing.ClearingOperationIdentifier memory id, uint256 labaf) internal {
        adjustBalancesStorage().labafClearedAmountByAccountPartitionTypeAndId[id.tokenHolder][id.partition][
            id.clearingOperationType
        ][id.clearingId] = labaf;
    }

    function removeLabafClearing(IClearing.ClearingOperationIdentifier memory id) internal {
        delete adjustBalancesStorage().labafClearedAmountByAccountPartitionTypeAndId[id.tokenHolder][id.partition][
            id.clearingOperationType
        ][id.clearingId];
    }

    function calculateFactorForClearedAmountAdjustedAt(
        address tokenHolder,
        uint256 timestamp
    ) internal view returns (uint256) {
        return calculateFactor(getAbafAdjustedAt(timestamp), getTotalClearedLabaf(tokenHolder));
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // FROZEN LABAF
    // ═══════════════════════════════════════════════════════════════════════════════

    function getTotalFrozenLabaf(address tokenHolder) internal view returns (uint256) {
        return _zeroToOne(adjustBalancesStorage().labafFrozenAmountByAccount[tokenHolder]);
    }

    function getTotalFrozenLabafByPartition(bytes32 partition, address tokenHolder) internal view returns (uint256) {
        return _zeroToOne(adjustBalancesStorage().labafFrozenAmountByAccountAndPartition[tokenHolder][partition]);
    }

    function setTotalFreezeLabaf(address tokenHolder, uint256 labaf) internal {
        adjustBalancesStorage().labafFrozenAmountByAccount[tokenHolder] = labaf;
    }

    function setTotalFreezeLabafByPartition(bytes32 partition, address tokenHolder, uint256 labaf) internal {
        adjustBalancesStorage().labafFrozenAmountByAccountAndPartition[tokenHolder][partition] = labaf;
    }

    function calculateFactorForFrozenAmountAdjustedAt(
        address tokenHolder,
        uint256 timestamp
    ) internal view returns (uint256) {
        return calculateFactor(getAbafAdjustedAt(timestamp), getTotalFrozenLabaf(tokenHolder));
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // BALANCE ADJUSTMENT ORCHESTRATION
    // ═══════════════════════════════════════════════════════════════════════════════

    function adjustTotalAndMaxSupplyForPartition(bytes32 partition) internal {
        uint256 abaf = getAbaf();
        uint256 labaf = getLabafByPartition(partition);

        if (abaf == labaf) return;

        uint256 factor = calculateFactor(abaf, labaf);

        LibERC1410.adjustTotalSupplyByPartition(partition, factor);
        LibCap.adjustMaxSupplyByPartition(partition, factor);

        updateLabafByPartition(partition);
    }

    function adjustTotalBalanceAndPartitionBalanceFor(bytes32 partition, address account) internal {
        uint256 abaf = getAbaf();

        // Adjust partition balance
        uint256 partitionsIndex = LibERC1410.getPartitionIndex(account, partition);
        if (partitionsIndex != 0) {
            uint256 partitionFactor = calculateFactorByTokenHolderAndPartitionIndex(abaf, account, partitionsIndex);
            LibERC1410.multiplyPartitionAmount(account, partitionsIndex, partitionFactor);
            updateLabafByTokenHolderAndPartitionIndex(abaf, account, partitionsIndex);
        }

        // Adjust total balance
        uint256 factor = calculateFactorByAbafAndTokenHolder(abaf, account);
        LibERC1410.multiplyBalance(account, factor);
        updateLabafByTokenHolder(abaf, account);
    }

    function syncBalanceAdjustments(bytes32 partition, address from, address to) internal {
        adjustTotalAndMaxSupplyForPartition(partition);
        if (from != address(0)) {
            adjustTotalBalanceAndPartitionBalanceFor(partition, from);
        }
        if (to != address(0)) {
            adjustTotalBalanceAndPartitionBalanceFor(partition, to);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // ABAF-ADJUSTED BALANCE QUERIES
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Get ABAF-adjusted total balance for an account at a timestamp
    /// @dev Replaces _balanceOfAdjustedAt from ERC1410StandardStorageWrapper
    function balanceOfAdjustedAt(address account, uint256 timestamp) internal view returns (uint256) {
        uint256 factor = calculateFactor(getAbafAdjustedAt(timestamp), getLabafByUser(account));
        return LibERC1410.balanceOf(account) * factor;
    }

    /// @notice Get ABAF-adjusted balance by partition for an account at a timestamp
    /// @dev Replaces _balanceOfByPartitionAdjustedAt from ERC1410StandardStorageWrapper
    function balanceOfByPartitionAdjustedAt(
        bytes32 partition,
        address account,
        uint256 timestamp
    ) internal view returns (uint256) {
        uint256 factor = calculateFactor(getAbafAdjustedAt(timestamp), getLabafByUserAndPartition(partition, account));
        uint256 partitionIndex = LibERC1410.getPartitionIndex(account, partition);
        if (partitionIndex == 0) return 0;
        return LibERC1410.getPartitionAmount(account, partitionIndex) * factor;
    }

    /// @notice Get ABAF-adjusted total supply at a timestamp
    /// @dev Replaces _totalSupplyAdjustedAt from ERC1410StandardStorageWrapper
    function totalSupplyAdjustedAt(uint256 timestamp) internal view returns (uint256) {
        (uint256 pendingABAF, ) = getPendingAbafAt(timestamp);
        return LibERC1410.totalSupply() * pendingABAF;
    }

    /// @notice Get ABAF-adjusted total supply by partition at a timestamp
    /// @dev Replaces _totalSupplyByPartitionAdjustedAt from ERC1410StandardStorageWrapper
    function totalSupplyByPartitionAdjustedAt(bytes32 partition, uint256 timestamp) internal view returns (uint256) {
        uint256 factor = calculateFactor(getAbafAdjustedAt(timestamp), getLabafByPartition(partition));
        return LibERC1410.totalSupplyByPartition(partition) * factor;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // ORCHESTRATION
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Trigger pending scheduled tasks and sync balance adjustments
    /// @dev Replaces _triggerAndSyncAll from ERC1410StandardStorageWrapper
    function triggerAndSyncAll(bytes32 partition, address from, address to) internal {
        LibScheduledTasks.callTriggerPending();
        syncBalanceAdjustments(partition, from, to);
    }

    /// @notice Add a partition with LABAF tracking (ABAF-aware version)
    /// @dev Replaces _addPartitionTo from ERC1410StandardStorageWrapper
    /// Must be used instead of LibERC1410.addPartitionTo when ABAF is active
    function addPartitionToWithLabaf(uint256 value, address account, bytes32 partition) internal {
        pushLabafUserPartition(account, getAbaf());
        LibERC1410.pushPartition(account, value, partition);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // FACTOR CALCULATIONS (Pure)
    // ═══════════════════════════════════════════════════════════════════════════════

    function calculateFactor(uint256 abaf, uint256 labaf) internal pure returns (uint256) {
        return abaf / labaf;
    }

    function zeroToOne(uint256 input) internal pure returns (uint256) {
        return input == 0 ? 1 : input;
    }

    function checkFactor(uint256 factor) internal pure {
        if (factor == 0) revert IAdjustBalances.FactorIsZero();
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // PRIVATE HELPERS
    // ═══════════════════════════════════════════════════════════════════════════════

    function _zeroToOne(uint256 input) private pure returns (uint256) {
        return input == 0 ? 1 : input;
    }

    function getPendingAbafAt(uint256 timestamp) internal view returns (uint256 pendingAbaf_, uint8 pendingDecimals_) {
        return _getPendingScheduledBalanceAdjustmentsAt(timestamp);
    }

    function _getPendingScheduledBalanceAdjustmentsAt(
        uint256 timestamp
    ) private view returns (uint256 pendingAbaf_, uint8 pendingDecimals_) {
        pendingAbaf_ = 1;
        pendingDecimals_ = 0;

        ScheduledTasksDataStorage storage scheduledBalanceAdjustments = _scheduledBalanceAdjustmentStorage();

        uint256 scheduledTaskCount = LibScheduledTasksStorage.getScheduledTaskCount(scheduledBalanceAdjustments);

        for (uint256 i = 1; i <= scheduledTaskCount; i++) {
            uint256 pos = scheduledTaskCount - i;

            ScheduledTask memory scheduledTask = LibScheduledTasksStorage.getScheduledTasksByIndex(
                scheduledBalanceAdjustments,
                pos
            );

            if (scheduledTask.scheduledTimestamp < timestamp) {
                bytes32 actionId = abi.decode(scheduledTask.data, (bytes32));
                // Note: This assumes _getCorporateActionData is available via inheritance
                // For library usage, caller must handle corporate action lookup
                (, , bytes memory balanceAdjustmentData) = LibCorporateActions.getCorporateAction(actionId);
                IEquity.ScheduledBalanceAdjustment memory balanceAdjustment = abi.decode(
                    balanceAdjustmentData,
                    (IEquity.ScheduledBalanceAdjustment)
                );
                pendingAbaf_ *= balanceAdjustment.factor;
                pendingDecimals_ += balanceAdjustment.decimals;
            } else {
                break;
            }
        }
    }

    function _scheduledBalanceAdjustmentStorage()
        private
        pure
        returns (ScheduledTasksDataStorage storage scheduledBalanceAdjustments_)
    {
        bytes32 pos = _SCHEDULED_BALANCE_ADJUSTMENTS_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            scheduledBalanceAdjustments_.slot := pos
        }
    }
}
