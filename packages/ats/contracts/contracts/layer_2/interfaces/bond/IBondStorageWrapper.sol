// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

interface IBondStorageWrapper {
    /**
     * @notice Emitted when a coupon is created or updated for a bond or corporate action.
     * @param corporateActionId Unique identifier grouping related corporate actions or coupons.
     * @param couponId Identifier of the created or updated coupon.
     * @param operator Address that performed the operation.
     * @param recordDate Record date timestamp used to determine eligible holders.
     * @param executionDate Execution/payment date timestamp for the coupon.
     * @param rate Coupon rate or amount expressed in contract-specific units.
     * @param period Period length between coupon payments.
     */
    event CouponSet(
        bytes32 corporateActionId,
        uint256 couponId,
        address indexed operator,
        uint256 indexed recordDate,
        uint256 indexed executionDate,
        uint256 rate,
        uint256 rateDecimals,
        uint256 period
    );

    /**
     * @notice Emitted when a bond's maturity date is modified.
     * @param bondId Address of the bond whose maturity changed.
     * @param maturityDate New maturity timestamp.
     * @param previousMaturityDate Previous maturity timestamp prior to the update.
     */
    event MaturityDateUpdated(
        address indexed bondId,
        uint256 indexed maturityDate,
        uint256 indexed previousMaturityDate
    );

    /**
     * @notice Coupon creation failed due to an internal failure.
     */
    error CouponCreationFailed();

    /**
     * @notice Provided maturity date is invalid (e.g. in the past or before issuance).
     */
    error BondMaturityDateWrong();
}
