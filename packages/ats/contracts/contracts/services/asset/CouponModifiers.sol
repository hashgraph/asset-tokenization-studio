// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { CouponStorageWrapper } from "../../domain/asset/coupon/CouponStorageWrapper.sol";

/**
 * @title CouponModifiers
 * @notice Abstract contract providing coupon-related modifiers.
 * @dev Wraps `CouponStorageWrapper` validation into modifier form so it can be reused
 *      by any contract that does not face a stack-too-deep constraint. When the modifier
 *      cannot be used as a decorator (e.g. `CouponFacet.setCoupon` already chains seven
 *      modifiers), call `CouponStorageWrapper.checkEndDateAgainstMaturity` directly as
 *      the first statement of the function body instead.
 * @author Asset Tokenization Studio Team
 */
abstract contract CouponModifiers {
    /**
     * @notice Reverts when the security has a non-zero maturity date and `_endDate` exceeds it.
     * @dev Delegates to `CouponStorageWrapper.checkEndDateAgainstMaturity`. Securities without a
     *      maturity date (maturity date == 0) always pass.
     * @param _endDate Coupon end date to validate against the security's maturity date.
     */
    modifier onlyValidCouponEndDate(uint256 _endDate) {
        CouponStorageWrapper.checkEndDateAgainstMaturity(_endDate);
        _;
    }

    /**
     * @notice Reverts if any non-cancelled coupon still has an unresolved (PENDING) rate.
     * @dev Delegates to `CouponStorageWrapper.checkPendingCoupons`. Guards operations that
     *      change the coupon rate type, so a coupon issued under the previous type cannot be
     *      left permanently unresolved by the switch.
     */
    modifier onlyNoPendingCoupons() {
        CouponStorageWrapper.checkPendingCoupons();
        _;
    }
}
