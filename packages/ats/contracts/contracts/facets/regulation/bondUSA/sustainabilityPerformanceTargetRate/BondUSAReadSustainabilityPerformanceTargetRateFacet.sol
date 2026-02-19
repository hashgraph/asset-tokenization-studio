// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    _BOND_SUSTAINABILITY_PERFORMANCE_TARGET_READ_RESOLVER_KEY
} from "../../../../constants/resolverKeys/assets.sol";
import { BondUSAReadFacetBase } from "../BondUSAReadFacetBase.sol";
import { IBondRead } from "../../../assetCapabilities/interfaces/bond/IBondRead.sol";
// solhint-disable max-line-length
import {
    ISustainabilityPerformanceTargetRate
} from "../../../assetCapabilities/interfaces/interestRates/sustainabilityPerformanceTargetRate/ISustainabilityPerformanceTargetRate.sol";
// solhint-enable max-line-length
import { LibBond } from "../../../../lib/domain/LibBond.sol";
import { LibInterestRate } from "../../../../lib/domain/LibInterestRate.sol";
import { LibKpis } from "../../../../lib/domain/LibKpis.sol";
import { LibProceedRecipients } from "../../../../lib/domain/LibProceedRecipients.sol";
import { SustainabilityPerformanceTargetRateDataStorage } from "../../../../storage/ScheduledStorage.sol";
import { LibCorporateActions } from "../../../../lib/core/LibCorporateActions.sol";
import { COUPON_CORPORATE_ACTION_TYPE } from "../../../../constants/values.sol";

contract BondUSAReadSustainabilityPerformanceTargetRateFacet is BondUSAReadFacetBase {
    function getCoupon(
        uint256 _couponID
    ) external view override returns (IBondRead.RegisteredCoupon memory registeredCoupon_) {
        // Validate corporate action type
        LibCorporateActions.validateMatchingActionType(COUPON_CORPORATE_ACTION_TYPE, _couponID - 1);

        // Get the base coupon from storage
        registeredCoupon_ = LibBond.getCoupon(_couponID);

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

    function getStaticResolverKey() external pure virtual override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _BOND_SUSTAINABILITY_PERFORMANCE_TARGET_READ_RESOLVER_KEY;
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
        // Get SPT rate storage reference
        SustainabilityPerformanceTargetRateDataStorage storage sptRateStorage = LibInterestRate.getSustainabilityRate();

        // Check if we're before the start period
        if (_coupon.fixingDate < sptRateStorage.startPeriod) {
            return (sptRateStorage.startRate, sptRateStorage.rateDecimals);
        }

        // Get the base rate and decimals
        (uint256 baseRate, uint8 decimals) = LibInterestRate.getBaseRate();

        // Determine the start of the KPI data period (previous coupon's fixing date or 0)
        uint256 periodStart = _getPreviousFixingDate(_couponID);

        // Aggregate rate adjustments from all proceed recipients (projects)
        address[] memory projects = LibProceedRecipients.getProceedRecipients(
            0,
            LibProceedRecipients.getProceedRecipientsCount()
        );

        int256 totalRateAdjustment = 0;

        for (uint256 index = 0; index < projects.length; ) {
            address project = projects[index];

            // Get the impact data configuration for this project
            ISustainabilityPerformanceTargetRate.ImpactData memory impactData = LibInterestRate
                .getSustainabilityImpactData(project);

            // Get the latest KPI data for this project (from previous fixing date to current)
            (uint256 value, bool exists) = LibKpis.getLatestKpiData(periodStart, _coupon.fixingDate, project);

            // Calculate the rate adjustment for this project
            int256 adjustment = LibInterestRate.calculateRateAdjustment(impactData, value, exists);
            totalRateAdjustment += adjustment;

            unchecked {
                ++index;
            }
        }

        // Apply adjustments to base rate, ensuring result doesn't go below 0
        int256 finalRate = int256(baseRate) + totalRateAdjustment;
        if (finalRate < 0) {
            finalRate = 0;
        }

        return (uint256(finalRate), decimals);
    }

    /// @notice Get the fixing date of the previous coupon
    /// @param _couponID Current coupon ID (to find the previous one)
    /// @return fixingDate_ The previous coupon's fixing date, or 0 if no previous coupon
    function _getPreviousFixingDate(uint256 _couponID) internal view returns (uint256 fixingDate_) {
        uint256 previousCouponId = LibBond.getPreviousCouponInOrderedList(_couponID, _getBlockTimestamp());

        if (previousCouponId == 0) {
            return 0;
        }

        IBondRead.Coupon memory previousCoupon = LibBond.getCoupon(previousCouponId).coupon;
        return previousCoupon.fixingDate;
    }
}
