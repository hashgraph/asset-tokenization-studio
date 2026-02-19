// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IStaticFunctionSelectors } from "../../../../infrastructure/interfaces/IStaticFunctionSelectors.sol";
import { IScheduledSnapshots } from "../../interfaces/scheduledTasks/scheduledSnapshots/IScheduledSnapshots.sol";
import { ScheduledTask } from "../../interfaces/scheduledTasks/scheduledTasksCommon/IScheduledTasksCommon.sol";
import { LibScheduledTasks } from "../../../../lib/domain/LibScheduledTasks.sol";

/// @title ScheduledSnapshotsFacetBase
/// @notice Read-only facade for scheduled snapshots using library calls
/// @dev Implements IScheduledSnapshots interface with direct LibScheduledTasks calls
abstract contract ScheduledSnapshotsFacetBase is IScheduledSnapshots, IStaticFunctionSelectors {
    /// @notice Get the count of scheduled snapshots
    /// @return The total number of scheduled snapshots
    function scheduledSnapshotCount() external view override returns (uint256) {
        return LibScheduledTasks.getScheduledSnapshotCount();
    }

    /// @notice Get paginated scheduled snapshots
    /// @param _pageIndex The page index (0-based)
    /// @param _pageLength The number of items per page
    /// @return scheduledSnapshot_ Array of scheduled tasks for the requested page
    function getScheduledSnapshots(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (ScheduledTask[] memory scheduledSnapshot_) {
        scheduledSnapshot_ = LibScheduledTasks.getScheduledSnapshots(_pageIndex, _pageLength);
    }

    /// @notice Get the function selectors for this facet
    /// @return staticFunctionSelectors_ Array of function selectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](2);
        staticFunctionSelectors_[selectorIndex++] = this.scheduledSnapshotCount.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getScheduledSnapshots.selector;
    }

    /// @notice Get the interface IDs for this facet
    /// @return staticInterfaceIds_ Array of interface IDs
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IScheduledSnapshots).interfaceId;
    }
}
