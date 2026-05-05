// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ICouponTypes } from "../coupon/ICouponTypes.sol";

/**
 * @title ICouponSecurityHolders
 * @notice Interface for querying the set of security holders associated with a coupon.
 * @dev Functions revert with `WrongIndexForAction` (via `onlyMatchingActionType`) when
 *      `_couponID` does not resolve to an existing coupon corporate action.
 *      Holder data is sourced from the snapshot taken at the coupon record date when
 *      available; otherwise the current token-holder enumeration is used.
 * @author Asset Tokenization Studio Team
 */
interface ICouponSecurityHolders is ICouponTypes {
    /**
     * @notice Returns a paginated list of token holders eligible for a coupon.
     * @dev Holders are resolved from the snapshot at the coupon record date when one
     *      exists; falls back to the live holder list if no snapshot has been taken.
     *      Returns an empty array if the record date has not yet been reached.
     * @param _couponID    Identifier of the target coupon (1-based index).
     * @param _pageIndex   Zero-based page number for pagination.
     * @param _pageLength  Maximum number of addresses to return per page.
     * @return holders_    Ordered array of holder addresses for the requested page.
     */
    function getCouponHolders(
        uint256 _couponID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (address[] memory holders_);

    /**
     * @notice Returns coupon information for every holder of a given coupon, paginated.
     * @dev Internally resolves the holder page then retrieves per-holder coupon details.
     *      The two returned arrays share the same index: `couponFor_[i]` corresponds
     *      to `holders_[i]`.
     * @param _couponID    Identifier of the target coupon (1-based index).
     * @param _pageIndex   Zero-based page number for pagination.
     * @param _pageLength  Maximum number of records to return per page.
     * @return couponFor_  Per-holder coupon details for the requested page.
     * @return holders_   Holder addresses corresponding to each entry in `couponFor_`.
     */
    function getCouponsFor(
        uint256 _couponID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (CouponFor[] memory couponFor_, address[] memory holders_);

    /**
     * @notice Returns the total number of security holders eligible for a coupon.
     * @dev Count is taken from the snapshot at the coupon record date when one exists;
     *      falls back to the live total if no snapshot has been taken.
     *      Returns zero if the record date has not yet been reached.
     * @param _couponID  Identifier of the target coupon (1-based index).
     * @return           Total number of eligible holders.
     */
    function getTotalCouponHolders(uint256 _couponID) external view returns (uint256);
}
