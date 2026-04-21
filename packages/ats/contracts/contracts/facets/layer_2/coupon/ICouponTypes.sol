// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;
import { IKpiLinkedRateTypes } from "../interestRate/kpiLinkedRate/IKpiLinkedRateTypes.sol";

/**
 * @title ICouponTypes
 * @notice Single source of truth for all Coupon domain types (structs, enums)
 * @dev Inherits KpiLinkedRate structs and errors from IKpiLinkedRateErrors
 * @author Hashgraph
 */
interface ICouponTypes is IKpiLinkedRateTypes {
    /**
     * @notice Status of the coupon rate calculation process
     * @param PENDING Rate has not yet been determined
     * @param SET Rate has been successfully calculated and stored
     */
    enum RateCalculationStatus {
        PENDING,
        SET
    }

    /**
     * @notice Core coupon data structure
     * @dev Stores all relevant dates and rate information for a coupon payment
     * @param recordDate Timestamp when token holders are recorded for coupon eligibility
     * @param executionDate Scheduled timestamp for coupon payment processing
     * @param startDate Start of the interest accrual period
     * @param endDate End of the interest accrual period
     * @param fixingDate Date when the interest rate is finalised
     * @param rate Fixed or calculated interest rate for this coupon
     * @param rateDecimals Precision scaling factor for the rate value
     * @param rateStatus Current state of the rate calculation process
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
     * @notice Registered coupon with snapshot reference
     * @dev Links a coupon to a specific token holder snapshot
     * @param coupon The core coupon data structure
     * @param snapshotId Identifier for the associated token holder snapshot
     */
    struct RegisteredCoupon {
        Coupon coupon;
        uint256 snapshotId;
    }

    /**
     * @notice Coupon information for a specific account
     * @dev Contains coupon details and account-specific data
     * @param tokenBalance Account's token balance at the record date
     * @param nominalValue Face value of tokens held by the account
     * @param decimals Precision scaling for monetary values
     * @param recordDateReached Indicates if the record date has passed
     * @param coupon Reference to the underlying coupon data
     * @param couponAmount Calculated coupon payment amount for this account
     * @param isDisabled Flag indicating if coupon payments are disabled for this account
     */
    struct CouponFor {
        uint256 tokenBalance;
        uint256 nominalValue;
        uint8 decimals;
        bool recordDateReached;
        Coupon coupon;
        CouponAmountFor couponAmount;
        bool isDisabled;
    }

    /**
     * @notice Coupon payment amount representation
     * @dev Expressed as a fraction to handle rounding and precision
     * @param numerator Numerator component of the fractional amount
     * @param denominator Denominator component of the fractional amount
     * @param recordDateReached Indicates whether the record date condition was met
     */
    struct CouponAmountFor {
        uint256 numerator;
        uint256 denominator;
        bool recordDateReached;
    }
}
