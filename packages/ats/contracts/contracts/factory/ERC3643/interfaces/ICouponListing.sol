// SPDX-License-Identifier: Apache-2.0
// AUTO-GENERATED — DO NOT EDIT.
// Source: contracts/facets/couponListing/ICouponListing.sol
// Regenerated on every `npx hardhat compile` by the
// `erc3643-clone-interfaces` task in `tasks/compile.ts`.
// Edits to this file will be silently overwritten.
pragma solidity ^0.8.17;

import { ScheduledTask } from "./IScheduledTasksCommon.sol";

/**
 * @title ICouponListing
 * @author Asset Tokenization Studio Team
 * @notice Interface for read-only coupon and scheduled-coupon listing queries.
 * @dev Consolidates ordered-list methods previously in `ICoupon` and scheduled listing
 *      methods from the former `IScheduledCouponListing`.
 */
interface TRexICouponListing {
    /**
     * @notice Emitted once when the coupon listing capability is initialised on a token.
     * @dev Fires exclusively from `initializeCouponListing`.
     */
    event CouponListingInitialized();

    /**
     * @notice Initialises the coupon listing capability on the token.
     * @dev Callable once; subsequent calls revert with `FacetAlreadyRegistered`.
     *      Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment.
     */
    function initializeCouponListing() external;

    /// @notice Retrieves a coupon ID from the ordered list at a specific position.
    /// @param _pos              The position in the ordered coupon list.
    /// @param _includeDisabled  When true, cancelled coupons are counted in the list; when false,
    ///                          only active coupons are visible.
    /// @return couponID_ The coupon ID at the specified position.
    function getCouponFromOrderedListAt(uint256 _pos, bool _includeDisabled) external view returns (uint256 couponID_);

    /// @notice Retrieves a paginated list of coupon IDs in order.
    /// @param _pageIndex        The page index for pagination.
    /// @param _pageLength       The number of coupons per page.
    /// @param _includeDisabled  When true, cancelled coupons are included in the page; when false,
    ///                          only active coupons are returned.
    /// @return couponIDs_ Array of coupon IDs for the specified page.
    function getCouponsOrderedList(
        uint256 _pageIndex,
        uint256 _pageLength,
        bool _includeDisabled
    ) external view returns (uint256[] memory couponIDs_);

    /// @notice Retrieves the total number of coupons in the ordered list adjusted to the current timestamp.
    /// @param _includeDisabled  When true, cancelled coupons are counted; when false, only active
    ///                          coupons are counted.
    /// @return total_ The total count of coupons.
    function getCouponsOrderedListTotal(bool _includeDisabled) external view returns (uint256 total_);

    /// @notice Returns the number of scheduled coupon listing tasks.
    /// @param _includeDisabled  When true, tasks belonging to cancelled corporate actions are counted;
    ///                          when false, only active tasks are counted.
    /// @return The count of scheduled coupon listing tasks.
    function scheduledCouponListingCount(bool _includeDisabled) external view returns (uint256);

    /// @notice Retrieves a paginated list of scheduled coupon listing tasks.
    /// @param _pageIndex        The page index for pagination.
    /// @param _pageLength       The number of tasks per page.
    /// @param _includeDisabled  When true, tasks belonging to cancelled corporate actions are included;
    ///                          when false, only active tasks are returned.
    /// @return scheduledCouponListing_ Array of scheduled coupon listing tasks.
    function getScheduledCouponListing(
        uint256 _pageIndex,
        uint256 _pageLength,
        bool _includeDisabled
    ) external view returns (ScheduledTask[] memory scheduledCouponListing_);
}
