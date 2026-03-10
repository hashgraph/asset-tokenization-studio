// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { BondUSA } from "../BondUSA.sol";
import { IBondRead } from "../../../asset/bond/IBondRead.sol";
// solhint-disable max-line-length
import {
    ISustainabilityPerformanceTargetRate
} from "../../../asset/interestRate/sustainabilityPerformanceTargetRate/ISustainabilityPerformanceTargetRate.sol";
// solhint-enable max-line-length
import { BondStorageWrapper } from "../../../../domain/asset/BondStorageWrapper.sol";
import { InterestRateStorageWrapper } from "../../../../domain/asset/InterestRateStorageWrapper.sol";
import { KpisStorageWrapper } from "../../../../domain/asset/KpisStorageWrapper.sol";
import { ProceedRecipientsStorageWrapper } from "../../../../domain/asset/ProceedRecipientsStorageWrapper.sol";
import { PauseStorageWrapper } from "../../../../domain/core/PauseStorageWrapper.sol";
import { AccessStorageWrapper } from "../../../../domain/core/AccessStorageWrapper.sol";
import { CorporateActionsStorageWrapper } from "../../../../domain/core/CorporateActionsStorageWrapper.sol";
import { _CORPORATE_ACTION_ROLE } from "../../../../constants/roles.sol";

abstract contract BondUSASustainabilityPerformanceTargetRate is BondUSA {
    // ═══════════════════════════════════════════════════════════════════════════════
    // ERROR DEFINITIONS
    // ═══════════════════════════════════════════════════════════════════════════════

    error InterestRateIsSustainabilityPerformanceTarget();

    // ═══════════════════════════════════════════════════════════════════════════════
    // COUPON MANAGEMENT (OVERRIDE)
    // ═══════════════════════════════════════════════════════════════════════════════

    function setCoupon(IBondRead.Coupon calldata _newCoupon) external override returns (uint256 couponID_) {
        // Validate that coupon rate parameters are appropriate for SPT rate bond
        if (
            _newCoupon.rateStatus != IBondRead.RateCalculationStatus.PENDING ||
            _newCoupon.rate != 0 ||
            _newCoupon.rateDecimals != 0
        ) {
            revert InterestRateIsSustainabilityPerformanceTarget();
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

        // Calculate and update the SPT interest rate dynamically
        (uint256 rate, uint8 rateDecimals) = _calculateSustainabilityRate(_couponID, registeredCoupon_.coupon);
        registeredCoupon_.coupon.rate = rate;
        registeredCoupon_.coupon.rateDecimals = rateDecimals;
        registeredCoupon_.coupon.rateStatus = IBondRead.RateCalculationStatus.SET;
        return registeredCoupon_;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // INTERNAL SPT RATE CALCULATION
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Calculate sustainability performance target interest rate based on project impact data
    /// @param _couponID The coupon ID (for accessing previous coupon fixing date)
    /// @param _coupon The coupon data structure
    /// @return rate_ Calculated interest rate
    /// @return rateDecimals_ Decimal places for the calculated rate
    function _calculateSustainabilityRate(
        uint256 _couponID,
        IBondRead.Coupon memory _coupon
    ) internal view returns (uint256 rate_, uint8 rateDecimals_) {
        {
            (uint256 startPeriod, uint256 startRate, uint8 cfgDecimals) = InterestRateStorageWrapper
                .getSustainabilityRateConfig();
            if (_coupon.fixingDate < startPeriod) {
                return (startRate, cfgDecimals);
            }
        }

        (uint256 baseRate, uint8 decimals) = InterestRateStorageWrapper.getBaseRate();
        uint256 periodStart = _getPreviousFixingDate(_couponID);

        int256 totalRateAdjustment;
        {
            address[] memory projects = ProceedRecipientsStorageWrapper.getProceedRecipients(
                0,
                ProceedRecipientsStorageWrapper.getProceedRecipientsCount()
            );

            for (uint256 index = 0; index < projects.length; ) {
                address project = projects[index];
                ISustainabilityPerformanceTargetRate.ImpactData memory impactData = InterestRateStorageWrapper
                    .getSustainabilityImpactData(project);
                (uint256 value, bool exists) = KpisStorageWrapper.getLatestKpiData(
                    periodStart,
                    _coupon.fixingDate,
                    project
                );
                totalRateAdjustment += InterestRateStorageWrapper.calculateRateAdjustment(impactData, value, exists);
                unchecked {
                    ++index;
                }
            }
        }

        int256 finalRate = int256(baseRate) + totalRateAdjustment;
        if (finalRate < 0) finalRate = 0;

        return (uint256(finalRate), decimals);
    }

    /// @notice Get the fixing date of the previous coupon
    /// @param _couponID Current coupon ID (to find the previous one)
    /// @return fixingDate_ The previous coupon's fixing date, or 0 if no previous coupon
    function _getPreviousFixingDate(uint256 _couponID) internal view returns (uint256 fixingDate_) {
        uint256 previousCouponId = BondStorageWrapper.getPreviousCouponInOrderedList(_couponID, _getBlockTimestamp());

        if (previousCouponId == 0) {
            return 0;
        }

        IBondRead.Coupon memory previousCoupon = BondStorageWrapper.getCoupon(previousCouponId).coupon;
        return previousCoupon.fixingDate;
    }
}
