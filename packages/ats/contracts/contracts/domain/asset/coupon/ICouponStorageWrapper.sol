// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

interface ICouponStorageWrapper {
    /**
     * @notice Emitted when a coupon is cancelled.
     * @param couponId Identifier of the cancelled coupon.
     * @param operator Address that performed the cancellation.
     */
    event CouponCancelled(uint256 couponId, address indexed operator);

    /**
     * @notice Coupon creation failed due to an internal failure.
     */
    error CouponCreationFailed();

    /**
     * @notice Coupon execution failed because the coupon has already been executed or cancelled.
     */
    error CouponAlreadyExecuted(bytes32 corporateActionId, uint256 couponId);
}
