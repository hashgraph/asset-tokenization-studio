// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    _SCHEDULED_SNAPSHOTS_STORAGE_POSITION,
    _SCHEDULED_BALANCE_ADJUSTMENTS_STORAGE_POSITION,
    _SCHEDULED_COUPON_LISTING_STORAGE_POSITION,
    _SCHEDULED_CROSS_ORDERED_TASKS_STORAGE_POSITION
} from "../../constants/storagePositions.sol";
import { ScheduledTask, ScheduledTasksDataStorage } from "../../facets/asset/scheduledTask/IScheduledTasksCommon.sol";
import { ScheduledTasksStorage } from "./ScheduledTasksStorage.sol";
import { LowLevelCall } from "../../infrastructure/utils/LowLevelCall.sol";
import { IEquity } from "../../facets/asset/equity/IEquity.sol";
import { CorporateActionsStorageWrapper } from "../core/CorporateActionsStorageWrapper.sol";

/// @title ScheduledTasksStorageWrapper
/// @notice Leaf library for scheduled task management
/// @dev Extracted from StorageWrapper contracts for library-based diamond migration
library ScheduledTasksStorageWrapper {
    // ═══════════════════════════════════════════════════════════════════════════════
    // CROSS-ORDERED TASKS
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Call trigger pending scheduled cross-ordered tasks via low-level call
    /// @dev Uses low-level call pattern to invoke triggerPendingScheduledCrossOrderedTasks
    function callTriggerPending() internal returns (uint256) {
        bytes memory payload = abi.encodeWithSignature("triggerPendingScheduledCrossOrderedTasks()");
        bytes4 errorSelector = bytes4(keccak256("CallFailed()"));
        LowLevelCall.functionCall(address(this), payload, errorSelector);
        return 0;
    }

    /// @notice Add a scheduled cross-ordered task
    /// @param _timestamp The timestamp when the task should trigger
    /// @param _data The encoded task data (task type)
    function addScheduledCrossOrderedTask(uint256 _timestamp, bytes memory _data) internal {
        ScheduledTasksStorage.addScheduledTask(scheduledCrossOrderedTaskStorage(), _timestamp, _data);
    }

    /// @notice Remove the last scheduled cross-ordered task
    function popScheduledCrossOrderedTask() internal {
        ScheduledTasksStorage.popScheduledTask(scheduledCrossOrderedTaskStorage());
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // BALANCE ADJUSTMENT SCHEDULING
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Add a scheduled balance adjustment
    /// @param _timestamp The timestamp when the adjustment should trigger
    /// @param _data The encoded task data (action ID)
    function addScheduledBalanceAdjustment(uint256 _timestamp, bytes memory _data) internal {
        ScheduledTasksStorage.addScheduledTask(scheduledBalanceAdjustmentStorage(), _timestamp, _data);
    }

    /// @notice Remove the last scheduled balance adjustment
    function popScheduledBalanceAdjustment() internal {
        ScheduledTasksStorage.popScheduledTask(scheduledBalanceAdjustmentStorage());
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // SNAPSHOT SCHEDULING
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Add a scheduled snapshot
    /// @param _timestamp The timestamp when the snapshot should trigger
    /// @param _data The encoded task data (action ID)
    function addScheduledSnapshot(uint256 _timestamp, bytes memory _data) internal {
        ScheduledTasksStorage.addScheduledTask(scheduledSnapshotStorage(), _timestamp, _data);
    }

    /// @notice Remove the last scheduled snapshot
    function popScheduledSnapshot() internal {
        ScheduledTasksStorage.popScheduledTask(scheduledSnapshotStorage());
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // COUPON LISTING SCHEDULING
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Add a scheduled coupon listing
    /// @param _timestamp The timestamp when the coupon listing should trigger
    /// @param _data The encoded task data (action ID)
    function addScheduledCouponListing(uint256 _timestamp, bytes memory _data) internal {
        ScheduledTasksStorage.addScheduledTask(scheduledCouponListingStorage(), _timestamp, _data);
    }

    /// @notice Remove the last scheduled coupon listing
    function popScheduledCouponListing() internal {
        ScheduledTasksStorage.popScheduledTask(scheduledCouponListingStorage());
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // VIEW FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Get count of scheduled cross-ordered tasks
    /// @return The number of scheduled cross-ordered tasks
    function getScheduledCrossOrderedTaskCount() internal view returns (uint256) {
        return ScheduledTasksStorage.getScheduledTaskCount(scheduledCrossOrderedTaskStorage());
    }

    /// @notice Get paginated scheduled cross-ordered tasks
    /// @param _pageIndex The page index (0-based)
    /// @param _pageLength The number of items per page
    /// @return tasks Array of scheduled tasks for the requested page
    function getScheduledCrossOrderedTasks(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (ScheduledTask[] memory tasks) {
        return ScheduledTasksStorage.getScheduledTasks(scheduledCrossOrderedTaskStorage(), _pageIndex, _pageLength);
    }

    /// @notice Get a scheduled cross-ordered task by index
    /// @param _index The index of the task to retrieve
    /// @return The scheduled task at the index
    function getScheduledCrossOrderedTaskByIndex(uint256 _index) internal view returns (ScheduledTask memory) {
        return ScheduledTasksStorage.getScheduledTasksByIndex(scheduledCrossOrderedTaskStorage(), _index);
    }

    /// @notice Get count of scheduled balance adjustments
    /// @return The number of scheduled balance adjustments
    function getScheduledBalanceAdjustmentCount() internal view returns (uint256) {
        return ScheduledTasksStorage.getScheduledTaskCount(scheduledBalanceAdjustmentStorage());
    }

    /// @notice Get paginated scheduled balance adjustments
    /// @param _pageIndex The page index (0-based)
    /// @param _pageLength The number of items per page
    /// @return tasks Array of scheduled tasks for the requested page
    function getScheduledBalanceAdjustments(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (ScheduledTask[] memory tasks) {
        return ScheduledTasksStorage.getScheduledTasks(scheduledBalanceAdjustmentStorage(), _pageIndex, _pageLength);
    }

    /// @notice Get a scheduled balance adjustment by index
    /// @param _index The index of the adjustment to retrieve
    /// @return The scheduled task at the index
    function getScheduledBalanceAdjustmentByIndex(uint256 _index) internal view returns (ScheduledTask memory) {
        return ScheduledTasksStorage.getScheduledTasksByIndex(scheduledBalanceAdjustmentStorage(), _index);
    }

    /// @notice Get pending scheduled balance adjustments at a specific timestamp
    /// @param _timestamp The reference timestamp
    /// @return pendingAbaf The accumulated balance adjustment factor for pending tasks
    /// @return pendingDecimals The accumulated decimals for pending tasks
    /// @dev Iterates backwards through scheduled tasks, accumulating factor and decimals
    /// for all tasks with scheduledTimestamp <= _timestamp
    function getPendingScheduledBalanceAdjustmentsAt(
        uint256 _timestamp
    ) internal view returns (uint256 pendingAbaf, uint8 pendingDecimals) {
        pendingAbaf = 1;
        pendingDecimals = 0;

        ScheduledTasksDataStorage storage scheduledBalanceAdjustments = scheduledBalanceAdjustmentStorage();
        uint256 scheduledTaskCount = ScheduledTasksStorage.getScheduledTaskCount(scheduledBalanceAdjustments);

        for (uint256 i = 1; i <= scheduledTaskCount; i++) {
            uint256 pos = scheduledTaskCount - i;

            ScheduledTask memory scheduledTask = ScheduledTasksStorage.getScheduledTasksByIndex(
                scheduledBalanceAdjustments,
                pos
            );

            if (scheduledTask.scheduledTimestamp < _timestamp) {
                bytes32 actionId = abi.decode(scheduledTask.data, (bytes32));

                (, , bytes memory balanceAdjustmentData) = CorporateActionsStorageWrapper.getCorporateAction(actionId);

                IEquity.ScheduledBalanceAdjustment memory balanceAdjustment = abi.decode(
                    balanceAdjustmentData,
                    (IEquity.ScheduledBalanceAdjustment)
                );
                pendingAbaf *= balanceAdjustment.factor;
                pendingDecimals += balanceAdjustment.decimals;
            } else {
                break;
            }
        }
    }

    /// @notice Get count of scheduled snapshots
    /// @return The number of scheduled snapshots
    function getScheduledSnapshotCount() internal view returns (uint256) {
        return ScheduledTasksStorage.getScheduledTaskCount(scheduledSnapshotStorage());
    }

    /// @notice Get paginated scheduled snapshots
    /// @param _pageIndex The page index (0-based)
    /// @param _pageLength The number of items per page
    /// @return tasks Array of scheduled tasks for the requested page
    function getScheduledSnapshots(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (ScheduledTask[] memory tasks) {
        return ScheduledTasksStorage.getScheduledTasks(scheduledSnapshotStorage(), _pageIndex, _pageLength);
    }

    /// @notice Get a scheduled snapshot by index
    /// @param _index The index of the snapshot to retrieve
    /// @return The scheduled task at the index
    function getScheduledSnapshotByIndex(uint256 _index) internal view returns (ScheduledTask memory) {
        return ScheduledTasksStorage.getScheduledTasksByIndex(scheduledSnapshotStorage(), _index);
    }

    /// @notice Get count of scheduled coupon listings
    /// @return The number of scheduled coupon listings
    function getScheduledCouponListingCount() internal view returns (uint256) {
        return ScheduledTasksStorage.getScheduledTaskCount(scheduledCouponListingStorage());
    }

    /// @notice Get paginated scheduled coupon listings
    /// @param _pageIndex The page index (0-based)
    /// @param _pageLength The number of items per page
    /// @return tasks Array of scheduled tasks for the requested page
    function getScheduledCouponListing(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (ScheduledTask[] memory tasks) {
        return ScheduledTasksStorage.getScheduledTasks(scheduledCouponListingStorage(), _pageIndex, _pageLength);
    }

    /// @notice Get count of pending scheduled coupon listings at a specific timestamp
    /// @param _timestamp The reference timestamp
    /// @return total The number of pending coupon listings before the timestamp
    /// @dev Counts all tasks with scheduledTimestamp <= _timestamp
    function getPendingScheduledCouponListingTotalAt(uint256 _timestamp) internal view returns (uint256 total) {
        total = 0;

        ScheduledTasksDataStorage storage scheduledCouponListing = scheduledCouponListingStorage();
        uint256 scheduledTaskCount = ScheduledTasksStorage.getScheduledTaskCount(scheduledCouponListing);

        for (uint256 i = 1; i <= scheduledTaskCount; i++) {
            uint256 pos = scheduledTaskCount - i;

            ScheduledTask memory scheduledTask = ScheduledTasksStorage.getScheduledTasksByIndex(
                scheduledCouponListing,
                pos
            );

            if (scheduledTask.scheduledTimestamp < _timestamp) {
                total++;
            } else {
                break;
            }
        }
    }

    /// @notice Get specific pending coupon listing ID at index
    /// @param _index The index of the coupon listing to retrieve
    /// @return couponID The coupon ID from the action data
    function getScheduledCouponListingIdAtIndex(uint256 _index) internal view returns (uint256 couponID) {
        ScheduledTask memory couponListing = ScheduledTasksStorage.getScheduledTasksByIndex(
            scheduledCouponListingStorage(),
            _index
        );

        bytes32 actionId = abi.decode(couponListing.data, (bytes32));

        (, couponID, ) = CorporateActionsStorageWrapper.getCorporateAction(actionId);
    }

    /// @notice Get a scheduled coupon listing by index
    /// @param _index The index of the coupon listing to retrieve
    /// @return The scheduled task at the index
    function getScheduledCouponListingByIndex(uint256 _index) internal view returns (ScheduledTask memory) {
        return ScheduledTasksStorage.getScheduledTasksByIndex(scheduledCouponListingStorage(), _index);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // PRIVATE STORAGE ACCESSORS
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @dev Access scheduled cross-ordered tasks storage
    function scheduledCrossOrderedTaskStorage()
        internal
        pure
        returns (ScheduledTasksDataStorage storage scheduledCrossOrderedTasks)
    {
        bytes32 position = _SCHEDULED_CROSS_ORDERED_TASKS_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            scheduledCrossOrderedTasks.slot := position
        }
    }

    /// @dev Access scheduled balance adjustments storage
    function scheduledBalanceAdjustmentStorage()
        internal
        pure
        returns (ScheduledTasksDataStorage storage scheduledBalanceAdjustments)
    {
        bytes32 position = _SCHEDULED_BALANCE_ADJUSTMENTS_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            scheduledBalanceAdjustments.slot := position
        }
    }

    /// @dev Access scheduled snapshots storage
    function scheduledSnapshotStorage() internal pure returns (ScheduledTasksDataStorage storage scheduledSnapshots) {
        bytes32 position = _SCHEDULED_SNAPSHOTS_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            scheduledSnapshots.slot := position
        }
    }

    /// @dev Access scheduled coupon listings storage
    function scheduledCouponListingStorage()
        internal
        pure
        returns (ScheduledTasksDataStorage storage scheduledCouponListing)
    {
        bytes32 position = _SCHEDULED_COUPON_LISTING_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            scheduledCouponListing.slot := position
        }
    }
}
