// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IKpiLinkedRateErrors } from "../layer_2/interestRate/kpiLinkedRate/IKpiLinkedRateErrors.sol";

/**
 * @title ICouponTypes
 * @author Asset Tokenization Studio Team
 * @notice Shared type module for the coupon domain — every facet, library, and storage wrapper
 *         that handles coupons references its structs and enums through this interface.
 * @dev Pure types tier: structs + enums only. Domain events and errors live on the writer
 *      interface (`ICoupon`) where they are emitted/reverted; placing them here would force
 *      read-only sibling facets that inherit `ICouponTypes` to pick up symbols they never
 *      use, bloating their EIP-165 interfaceId. Inherits `IKpiLinkedRateErrors` so the
 *      KPI-linked rate variants can revert with the shared error set without redeclaration.
 */
interface ICouponTypes is IKpiLinkedRateErrors {
    /**
     * @notice Status of the rate-calculation lifecycle for a coupon.
     * @dev `PENDING` is set on creation for variants that compute the rate later (KPI-linked,
     *      SPT). `SET` is set when the rate has been resolved and persisted into the coupon.
     */
    enum RateCalculationStatus {
        PENDING,
        SET
    }

    /**
     * @notice Parameters captured when an operator schedules a new coupon corporate action.
     * @dev `recordDate` is the snapshot deadline; `executionDate` is when the coupon is paid;
     *      `startDate`/`endDate` bound the accrual window; `fixingDate` is the timestamp at
     *      which the rate is fixed for variants that compute it dynamically.
     * @param recordDate Unix timestamp of the snapshot taken to determine eligible holders.
     * @param executionDate Unix timestamp on which the coupon becomes payable.
     * @param startDate Unix timestamp at which coupon accrual begins.
     * @param endDate Unix timestamp at which coupon accrual ends.
     * @param fixingDate Unix timestamp at which the rate is fixed for dynamic-rate variants.
     * @param rate Rate value scaled by `rateDecimals`. Zero on creation for dynamic variants.
     * @param rateDecimals Decimal precision applied to `rate`.
     * @param rateStatus Lifecycle marker — `PENDING` until the rate is resolved, `SET` after.
     */
    struct Coupon {
        uint256 recordDate;
        uint256 executionDate;
        uint256 startDate;
        uint256 endDate;
        uint256 fixingDate;
        uint256 rate;
        uint8 rateDecimals;
        RateCalculationStatus rateStatus;
    }

    /**
     * @notice Persisted coupon record returned by domain queries — pairs the original
     *         parameters with the snapshot id the storage layer has bound to it.
     * @param coupon The original `Coupon` parameters captured at scheduling time.
     * @param snapshotId Identifier of the holder snapshot bound to this coupon; zero before
     *        the record date is reached.
     */
    struct RegisteredCoupon {
        Coupon coupon;
        uint256 snapshotId;
    }

    /**
     * @notice Per-account view of a coupon, including the holder balance at the record date
     *         and the metadata required to compute the payable amount.
     * @dev `recordDateReached` is true once the record date has passed; until then the balance
     *      and `couponAmount` fields are not yet meaningful.
     * @param tokenBalance Holder balance captured at the coupon snapshot (or zero if not yet reached).
     * @param nominalValue Nominal value of the underlying bond per unit, used for amount maths.
     * @param decimals Decimal precision of the underlying token at the snapshot.
     * @param recordDateReached True once the record date has passed.
     * @param coupon Underlying `Coupon` parameters.
     * @param couponAmount Fractional payable amount for the holder.
     * @param isDisabled True when the coupon has been cancelled.
     */
    struct CouponFor {
        uint256 tokenBalance;
        uint8 decimals;
        uint256 nominalValue;
        uint256 nominalValueDecimals;
        bool recordDateReached;
        Coupon coupon;
        CouponAmountFor couponAmount;
        bool isDisabled;
    }

    /**
     * @notice Fractional coupon amount payable to a specific holder.
     * @dev Expressed as `numerator / denominator` to defer rounding decisions to the caller and
     *      avoid precision loss in on-chain integer arithmetic.
     * @param numerator Numerator of the payable fraction.
     * @param denominator Denominator of the payable fraction; never zero when `recordDateReached`.
     * @param recordDateReached True once the record date has passed; numerator/denominator are
     *        only meaningful when this is set.
     */
    struct CouponAmountFor {
        uint256 numerator;
        uint256 denominator;
        bool recordDateReached;
    }
}
