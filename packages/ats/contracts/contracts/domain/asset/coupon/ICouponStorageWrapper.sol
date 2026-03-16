// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ICoupon } from "../../../facets/layer_2/coupon/ICoupon.sol";

interface ICouponStorageWrapper {
    /**
     * @notice Emitted when a coupon is created or updated for a security.
     * @param corporateActionId Unique identifier grouping related corporate actions.
     * @param couponId Identifier of the created or updated coupon.
     * @param operator Address that performed the operation.
     * @param coupon Coupon struct containing recordDate, executionDate, rate, and period.
     */
    event CouponSet(bytes32 corporateActionId, uint256 couponId, address indexed operator, ICoupon.Coupon coupon);

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
