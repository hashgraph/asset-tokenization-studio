// SPDX-License-Identifier: Apache-2.0
// AUTO-GENERATED — DO NOT EDIT.
// Source: contracts/facets/couponListing/ICouponListing.sol
// Regenerated on every `npx hardhat compile` by the
// `erc3643-clone-interfaces` task in `tasks/compile.ts`.
// Edits to this file will be silently overwritten.
pragma solidity ^0.8.17;

import { ScheduledTask } from "./IScheduledTasksCommon.sol";

/// @title ICouponListing
/// @notice Interface for coupon and scheduled-coupon listing queries.
interface TRexICouponListing {
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
