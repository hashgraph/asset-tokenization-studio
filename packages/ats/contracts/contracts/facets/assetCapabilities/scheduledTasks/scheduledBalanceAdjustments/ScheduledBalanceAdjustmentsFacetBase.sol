// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IStaticFunctionSelectors } from "../../../../infrastructure/interfaces/IStaticFunctionSelectors.sol";
import {
    IScheduledBalanceAdjustments
} from "../../interfaces/scheduledTasks/scheduledBalanceAdjustments/IScheduledBalanceAdjustments.sol";
import { ScheduledTask } from "../../interfaces/scheduledTasks/scheduledTasksCommon/IScheduledTasksCommon.sol";
import { LibScheduledTasks } from "../../../../lib/domain/LibScheduledTasks.sol";

/// @title ScheduledBalanceAdjustmentsFacetBase
/// @notice Read-only facade for scheduled balance adjustments using library calls
/// @dev Implements IScheduledBalanceAdjustments interface with direct LibScheduledTasks calls
abstract contract ScheduledBalanceAdjustmentsFacetBase is IScheduledBalanceAdjustments, IStaticFunctionSelectors {
    /// @notice Get the count of scheduled balance adjustments
    /// @return The total number of scheduled balance adjustments
    function scheduledBalanceAdjustmentCount() external view override returns (uint256) {
        return LibScheduledTasks.getScheduledBalanceAdjustmentCount();
    }

    /// @notice Get paginated scheduled balance adjustments
    /// @param _pageIndex The page index (0-based)
    /// @param _pageLength The number of items per page
    /// @return scheduledBalanceAdjustment_ Array of scheduled tasks for the requested page
    function getScheduledBalanceAdjustments(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (ScheduledTask[] memory scheduledBalanceAdjustment_) {
        scheduledBalanceAdjustment_ = LibScheduledTasks.getScheduledBalanceAdjustments(_pageIndex, _pageLength);
    }

    /// @notice Get the function selectors for this facet
    /// @return staticFunctionSelectors_ Array of function selectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](2);
        staticFunctionSelectors_[selectorIndex++] = this.scheduledBalanceAdjustmentCount.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getScheduledBalanceAdjustments.selector;
    }

    /// @notice Get the interface IDs for this facet
    /// @return staticInterfaceIds_ Array of interface IDs
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IScheduledBalanceAdjustments).interfaceId;
    }
}
