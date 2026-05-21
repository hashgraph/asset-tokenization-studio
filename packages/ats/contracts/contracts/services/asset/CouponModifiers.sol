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
     * @notice Reverts when the bond has a non-zero maturity date and `_endDate` exceeds it.
     * @dev Delegates to `CouponStorageWrapper.checkEndDateAgainstMaturity`. Open-ended bonds
     *      (maturity date == 0) always pass.
     * @param _endDate Coupon end date to validate against the bond's maturity date.
     */
    modifier onlyValidCouponEndDate(uint256 _endDate) {
        CouponStorageWrapper.checkEndDateAgainstMaturity(_endDate);
        _;
    }
}
