// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBondRead } from "./IBondRead.sol";

interface IBondStorageWrapper {
    /**
     * @notice Emitted when a coupon is created or updated for a bond or corporate action.
     * @param corporateActionId Unique identifier grouping related corporate actions or coupons.
     * @param couponId Identifier of the created or updated coupon.
     * @param operator Address that performed the operation.
     * @param coupon Coupon struct containing recordDate, executionDate, rate, and period.
     */
    event CouponSet(bytes32 corporateActionId, uint256 couponId, address indexed operator, IBondRead.Coupon coupon);

    /**
     * @notice Coupon creation failed due to an internal failure.
     */
    error CouponCreationFailed();

    /**
     * @notice Provided maturity date is invalid (e.g. in the past or before issuance).
     */
    error BondMaturityDateWrong();
}
