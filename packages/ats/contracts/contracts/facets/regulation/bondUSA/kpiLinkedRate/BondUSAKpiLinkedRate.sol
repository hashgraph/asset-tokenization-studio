// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { BondUSA } from "../BondUSA.sol";
import { IBondRead } from "../../../asset/bond/IBondRead.sol";
import { BondStorageWrapper } from "../../../../domain/asset/BondStorageWrapper.sol";
import { InterestRateStorageWrapper } from "../../../../domain/asset/InterestRateStorageWrapper.sol";
import { KpisStorageWrapper } from "../../../../domain/asset/KpisStorageWrapper.sol";
import { ProceedRecipientsStorageWrapper } from "../../../../domain/asset/ProceedRecipientsStorageWrapper.sol";
import { PauseStorageWrapper } from "../../../../domain/core/PauseStorageWrapper.sol";
import { AccessStorageWrapper } from "../../../../domain/core/AccessStorageWrapper.sol";
import { CorporateActionsStorageWrapper } from "../../../../domain/core/CorporateActionsStorageWrapper.sol";
import { _CORPORATE_ACTION_ROLE } from "../../../../constants/roles.sol";

abstract contract BondUSAKpiLinkedRate is BondUSA {
    // ═══════════════════════════════════════════════════════════════════════════════
    // ERROR DEFINITIONS
    // ═══════════════════════════════════════════════════════════════════════════════

    error InterestRateIsKpiLinked();

    // ═══════════════════════════════════════════════════════════════════════════════
    // COUPON MANAGEMENT (OVERRIDE)
    // ═══════════════════════════════════════════════════════════════════════════════

    function setCoupon(IBondRead.Coupon calldata _newCoupon) external override returns (uint256 couponID_) {
        // Validate that coupon rate parameters are appropriate for KPI-linked rate bond
        if (
            _newCoupon.rateStatus != IBondRead.RateCalculationStatus.PENDING ||
            _newCoupon.rate != 0 ||
            _newCoupon.rateDecimals != 0
        ) {
            revert InterestRateIsKpiLinked();
        }

        // Proceed with standard coupon creation (rate will be calculated dynamically on read)
        PauseStorageWrapper.requireNotPaused();
        AccessStorageWrapper.checkRole(_CORPORATE_ACTION_ROLE);
        CorporateActionsStorageWrapper.validateDates(_newCoupon.startDate, _newCoupon.endDate);
        CorporateActionsStorageWrapper.validateDates(_newCoupon.recordDate, _newCoupon.executionDate);
        CorporateActionsStorageWrapper.validateDates(_newCoupon.fixingDate, _newCoupon.executionDate);
        _requireValidTimestamp(_newCoupon.recordDate);
        _requireValidTimestamp(_newCoupon.fixingDate);

        bytes32 corporateActionID;
        (corporateActionID, couponID_) = BondStorageWrapper.setCoupon(_newCoupon);
    }

    function getCoupon(uint256 _couponID) external view returns (IBondRead.RegisteredCoupon memory registeredCoupon_) {
        // Get the base coupon from storage
        registeredCoupon_ = BondStorageWrapper.getCoupon(_couponID);

        // Only calculate rate if:
        // 1. Rate hasn't been set yet (PENDING status), AND
        // 2. We've reached or passed the fixing date
        if (registeredCoupon_.coupon.rateStatus == IBondRead.RateCalculationStatus.SET) {
            return registeredCoupon_;
        }

        if (registeredCoupon_.coupon.fixingDate > _getBlockTimestamp()) {
            return registeredCoupon_;
        }

        // Calculate and update the KPI-linked interest rate dynamically
        (uint256 rate, uint8 rateDecimals) = _calculateKpiLinkedInterestRate(_couponID, registeredCoupon_.coupon);
        registeredCoupon_.coupon.rate = rate;
        registeredCoupon_.coupon.rateDecimals = rateDecimals;
        registeredCoupon_.coupon.rateStatus = IBondRead.RateCalculationStatus.SET;
        return registeredCoupon_;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // INTERNAL KPI RATE CALCULATION
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Calculate KPI-linked interest rate based on impact data
    /// @param _couponID The coupon ID (for accessing previous coupon rate)
    /// @param _coupon The coupon data structure
    /// @return rate_ Calculated interest rate
    /// @return rateDecimals_ Decimal places for the calculated rate
    function _calculateKpiLinkedInterestRate(
        uint256 _couponID,
        IBondRead.Coupon memory _coupon
    ) internal view returns (uint256 rate_, uint8 rateDecimals_) {
        // Check if we're before the start period
        (uint256 startPeriod, uint256 startRate, uint8 rateDecimals, uint256 reportPeriod) = InterestRateStorageWrapper
            .getKpiLinkedRateConfig();

        if (_coupon.fixingDate < startPeriod) {
            return (startRate, rateDecimals);
        }

        // Aggregate KPI data from all proceed recipients
        address[] memory projects = ProceedRecipientsStorageWrapper.getProceedRecipients(
            0,
            ProceedRecipientsStorageWrapper.getProceedRecipientsCount()
        );
        uint256 impactData = 0;
        bool reportFound = false;

        for (uint256 index = 0; index < projects.length; ) {
            (uint256 value, bool exists) = KpisStorageWrapper.getLatestKpiData(
                _coupon.fixingDate - reportPeriod,
                _coupon.fixingDate,
                projects[index]
            );

            if (exists) {
                impactData += value;
                if (!reportFound) reportFound = true;
            }

            unchecked {
                ++index;
            }
        }

        // Get the previous coupon rate (if no coupon exists, returns 0)
        (uint256 previousRate, uint8 previousRateDecimals) = _getPreviousCouponRate(_couponID);

        // Calculate and return the rate
        return
            InterestRateStorageWrapper.calculateKpiLinkedRate(
                impactData,
                previousRate,
                previousRateDecimals,
                reportFound
            );
    }

    /// @notice Get the rate and decimals of the previous coupon
    /// @param _couponID Current coupon ID (to find the previous one)
    /// @return rate_ The previous coupon rate
    /// @return rateDecimals_ The previous coupon rate decimals
    function _getPreviousCouponRate(uint256 _couponID) internal view returns (uint256 rate_, uint8 rateDecimals_) {
        uint256 previousCouponId = BondStorageWrapper.getPreviousCouponInOrderedList(_couponID, _getBlockTimestamp());

        if (previousCouponId == 0) {
            return (0, 0);
        }

        // Recursively get the previous coupon through getCoupon to ensure rate is calculated
        IBondRead.RegisteredCoupon memory previousCoupon = this.getCoupon(previousCouponId);

        // Return the rate only if it was set
        if (previousCoupon.coupon.rateStatus == IBondRead.RateCalculationStatus.SET) {
            return (previousCoupon.coupon.rate, previousCoupon.coupon.rateDecimals);
        }

        return (0, 0);
    }
}
