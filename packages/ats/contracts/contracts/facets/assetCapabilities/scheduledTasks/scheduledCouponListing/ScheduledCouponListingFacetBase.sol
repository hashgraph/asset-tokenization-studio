// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IStaticFunctionSelectors } from "../../../../infrastructure/interfaces/IStaticFunctionSelectors.sol";
import {
    IScheduledCouponListing
} from "../../interfaces/scheduledTasks/scheduledCouponListing/IScheduledCouponListing.sol";
import { ScheduledTask } from "../../interfaces/scheduledTasks/scheduledTasksCommon/IScheduledTasksCommon.sol";
import { LibScheduledTasks } from "../../../../lib/domain/LibScheduledTasks.sol";

/// @title ScheduledCouponListingFacetBase
/// @notice Read-only facade for scheduled coupon listings using library calls
/// @dev Implements IScheduledCouponListing interface with direct LibScheduledTasks calls
abstract contract ScheduledCouponListingFacetBase is IScheduledCouponListing, IStaticFunctionSelectors {
    /// @notice Get the count of scheduled coupon listings
    /// @return The total number of scheduled coupon listings
    function scheduledCouponListingCount() external view override returns (uint256) {
        return LibScheduledTasks.getScheduledCouponListingCount();
    }

    /// @notice Get paginated scheduled coupon listings
    /// @param _pageIndex The page index (0-based)
    /// @param _pageLength The number of items per page
    /// @return scheduledCouponListing_ Array of scheduled tasks for the requested page
    function getScheduledCouponListing(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (ScheduledTask[] memory scheduledCouponListing_) {
        scheduledCouponListing_ = LibScheduledTasks.getScheduledCouponListing(_pageIndex, _pageLength);
    }

    /// @notice Get the function selectors for this facet
    /// @return staticFunctionSelectors_ Array of function selectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](2);
        staticFunctionSelectors_[selectorIndex++] = this.scheduledCouponListingCount.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getScheduledCouponListing.selector;
    }

    /// @notice Get the interface IDs for this facet
    /// @return staticInterfaceIds_ Array of interface IDs
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IScheduledCouponListing).interfaceId;
    }
}
