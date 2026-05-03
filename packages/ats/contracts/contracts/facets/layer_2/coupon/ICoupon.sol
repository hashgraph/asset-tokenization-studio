// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ICouponTypes } from "./ICouponTypes.sol";

/// @title ICoupon
/// @notice Interface for coupon management functionality
interface ICoupon is ICouponTypes {
    /// @notice Emitted when a coupon is set
    /// @param corporateActionId The ID of the corporate action
    /// @param couponId The ID of the coupon
    /// @param operator The address of the operator who set the coupon
    /// @param coupon The coupon data that was set
    event CouponSet(
        bytes32 indexed corporateActionId,
        uint256 indexed couponId,
        address indexed operator,
        Coupon coupon
    );

    /// @notice Emitted when a coupon is cancelled
    /// @param couponId The ID of the cancelled coupon
    /// @param operator The address of the operator who cancelled the coupon
    event CouponCancelled(uint256 indexed couponId, address indexed operator);

    /// @notice Raised when attempting to execute a coupon that has already been executed
    /// @param corporateActionId The ID of the corporate action
    /// @param couponId The ID of the coupon
    error CouponAlreadyExecuted(bytes32 corporateActionId, uint256 couponId);

    /// @notice Raised when coupon creation fails
    error CouponCreationFailed();

    /// @notice Raised when attempting to set a coupon with invalid parameters for KPI-linked rate bonds
    error InterestRateIsKpiLinked();

    /// @notice Raised when a coupon ID does not resolve to an existing corporate action
    /// @param couponID The coupon identifier that was not found
    error CouponNotFound(uint256 couponID);

    /// @notice Sets a new coupon for the security
    /// @param _newCoupon The new coupon to be set
    /// @return couponID_ The created coupon identifier
    function setCoupon(Coupon calldata _newCoupon) external returns (uint256 couponID_);

    /// @notice Cancels an existing coupon
    /// @param _couponID The ID of the coupon to be cancelled
    /// @return success_ Whether the cancellation was successful
    function cancelCoupon(uint256 _couponID) external returns (bool success_);

    /// @notice Retrieves a registered coupon by its ID
    /// @param _couponID The ID of the coupon to retrieve
    /// @return registeredCoupon_ The registered coupon data
    /// @return isDisabled_ Whether the coupon is disabled
    function getCoupon(
        uint256 _couponID
    ) external view returns (RegisteredCoupon memory registeredCoupon_, bool isDisabled_);

    /// @notice Retrieves coupon information for a specific account and coupon ID
    /// @dev Return value includes user balance at coupon record date
    /// @param _couponID The ID of the coupon
    /// @param _account The account address
    /// @return couponFor_ Coupon information for the specified account
    function getCouponFor(uint256 _couponID, address _account) external view returns (CouponFor memory couponFor_);

    /// @notice Retrieves coupon information for a specific coupon ID
    /// @param _couponID The ID of the coupon
    /// @param _pageIndex The page index for pagination
    /// @param _pageLength The number of records per page
    /// @return couponFor_ List of coupon information for accounts corresponding to the coupon ID
    /// @return accounts_ List of account addresses corresponding to the coupon information
    function getCouponsFor(
        uint256 _couponID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (CouponFor[] memory couponFor_, address[] memory accounts_);

    /// @notice Retrieves coupon amount numerator and denominator for a specific account and coupon ID
    /// @param _couponID The ID of the coupon
    /// @param _account The account address
    /// @return couponAmountFor_ Coupon amount information for the specified account
    function getCouponAmountFor(
        uint256 _couponID,
        address _account
    ) external view returns (CouponAmountFor memory couponAmountFor_);

    /// @notice Retrieves the total number of coupons set for the security
    /// @return couponCount_ The total count of coupons
    function getCouponCount() external view returns (uint256 couponCount_);

    /// @notice Retrieves a paginated list of coupon holders for a specific coupon ID
    /// @param _couponID The ID of the coupon
    /// @param _pageIndex The page index for pagination
    /// @param _pageLength The number of holders per page
    /// @return holders_ Array of holder addresses
    function getCouponHolders(
        uint256 _couponID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (address[] memory holders_);

    /// @notice Retrieves the total number of coupon holders for a specific coupon ID
    /// @dev It is the list of token holders at the snapshot taken at the record date
    /// @param _couponID The ID of the coupon
    /// @return The total number of coupon holders
    function getTotalCouponHolders(uint256 _couponID) external view returns (uint256);
}
