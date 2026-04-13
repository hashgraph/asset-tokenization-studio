// SPDX-License-Identifier: Apache-2.0
// AUTO-GENERATED — DO NOT EDIT.
// Source: contracts/facets/layer_2/bond/IBondRead.sol
// Regenerated on every `npx hardhat compile` by the
// `erc3643-clone-interfaces` task in `tasks/compile.ts`.
// Edits to this file will be silently overwritten.
pragma solidity ^0.8.17;

import { TRexIBondTypes as IBondTypes } from "./IBondTypes.sol";

/// @title IBondRead
/// @notice Read functions for Bond domain operations
interface TRexIBondRead is IBondTypes {
    /**
     * @notice Retrieves the bond details
     */
    function getBondDetails() external view returns (IBondTypes.BondDetailsData memory bondDetailsData_);

    /**
     * @notice Retrieves a registered coupon by its ID
     */
    function getCoupon(
        uint256 _couponID
    ) external view returns (IBondTypes.RegisteredCoupon memory registeredCoupon_, bool isDisabled_);

    /**
     * @notice Retrieves coupon information for a specific account and coupon ID
     * @dev Return value includes user balance at cupon record date
     */
    function getCouponFor(
        uint256 _couponID,
        address _account
    ) external view returns (IBondTypes.CouponFor memory couponFor_);

    /**
     * @notice Retrieves coupon amount numerator and denominator for a specific account
     * and coupon ID
     */
    function getCouponAmountFor(
        uint256 _couponID,
        address _account
    ) external view returns (IBondTypes.CouponAmountFor memory couponAmountFor_);

    /**
     * @notice Retrieves principal numerator and denominator for a specific account
     */
    function getPrincipalFor(address _account) external view returns (IBondTypes.PrincipalFor memory principalFor_);

    /**
     * @notice Retrieves the total number of coupons set for the bond
     * @dev Pending coupons are included in the count
     */
    function getCouponCount() external view returns (uint256 couponCount_);

    /**
     * @notice Retrieves a paginated list of coupon holders for a specific coupon ID
     */
    function getCouponHolders(
        uint256 _couponID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (address[] memory holders_);

    /**
     * @notice Retrieves the total number of coupon holders for a specific coupon ID
     * @dev It is the list of token holders at the snapshot taken at the record date
     */
    function getTotalCouponHolders(uint256 _couponID) external view returns (uint256);

    function getCouponFromOrderedListAt(uint256 _pos) external view returns (uint256 couponID_);

    function getCouponsOrderedList(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (uint256[] memory couponIDs_);

    function getCouponsOrderedListTotal() external view returns (uint256 total_);
}
