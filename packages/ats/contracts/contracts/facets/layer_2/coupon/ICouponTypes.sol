// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IKpiLinkedRateErrors } from "../interestRate/kpiLinkedRate/IKpiLinkedRateErrors.sol";

/// @title ICouponTypes
/// @notice Single source of truth for all Coupon domain types (structs, enums)
/// @dev Inherits KpiLinkedRate structs and errors from IKpiLinkedRateErrors
interface ICouponTypes is IKpiLinkedRateErrors {
    /// @notice Status of the coupon rate calculation process
    enum RateCalculationStatus {
        PENDING,
        SET
    }

    /// @notice Core coupon data structure
    /// @dev Stores all relevant dates and rate information for a coupon payment
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

    /// @notice Registered coupon with snapshot reference
    /// @dev Links a coupon to a specific token holder snapshot
    struct RegisteredCoupon {
        Coupon coupon;
        uint256 snapshotId;
    }

    /// @notice Coupon information for a specific account
    /// @dev Contains coupon details and account-specific data
    struct CouponFor {
        uint256 tokenBalance;
        uint256 nominalValue;
        uint8 decimals;
        bool recordDateReached;
        Coupon coupon;
        CouponAmountFor couponAmount;
        bool isDisabled;
    }

    /// @notice Coupon payment amount representation
    /// @dev Expressed as a fraction to handle rounding and precision
    struct CouponAmountFor {
        uint256 numerator;
        uint256 denominator;
        bool recordDateReached;
    }
}
