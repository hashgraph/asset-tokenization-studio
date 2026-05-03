// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ScheduledTask } from "../layer_2/scheduledTask/scheduledTasksCommon/IScheduledTasksCommon.sol";

/**
 * @title ICouponListing
 * @author Asset Tokenization Studio Team
 * @notice Interface for read-only coupon and scheduled-coupon listing queries.
 * @dev Consolidates ordered-list methods previously in `ICoupon` and scheduled listing
 *      methods from the former `IScheduledCouponListing`.
 */
interface ICouponListing {
    /// @notice Retrieves a coupon ID from the ordered list at a specific position.
    /// @param _pos The position in the ordered coupon list.
    /// @return couponID_ The coupon ID at the specified position.
    function getCouponFromOrderedListAt(uint256 _pos) external view returns (uint256 couponID_);

    /// @notice Retrieves a paginated list of coupon IDs in order.
    /// @param _pageIndex The page index for pagination.
    /// @param _pageLength The number of coupons per page.
    /// @return couponIDs_ Array of coupon IDs for the specified page.
    function getCouponsOrderedList(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (uint256[] memory couponIDs_);

    /// @notice Retrieves the total number of coupons in the ordered list adjusted to the current timestamp.
    /// @return total_ The total count of coupons.
    function getCouponsOrderedListTotal() external view returns (uint256 total_);

    /// @notice Returns the number of scheduled coupon listing tasks.
    /// @return The count of scheduled coupon listing tasks.
    function scheduledCouponListingCount() external view returns (uint256);

    /// @notice Retrieves a paginated list of scheduled coupon listing tasks.
    /// @param _pageIndex The page index for pagination.
    /// @param _pageLength The number of tasks per page.
    /// @return scheduledCouponListing_ Array of scheduled coupon listing tasks.
    function getScheduledCouponListing(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (ScheduledTask[] memory scheduledCouponListing_);
}
