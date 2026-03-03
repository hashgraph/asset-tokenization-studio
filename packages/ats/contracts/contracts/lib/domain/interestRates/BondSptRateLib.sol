// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBondRead } from "../../../facets/assetCapabilities/interfaces/bond/IBondRead.sol";
// solhint-disable max-line-length
import {
    ISustainabilityPerformanceTargetRate
} from "../../../facets/assetCapabilities/interfaces/interestRates/sustainabilityPerformanceTargetRate/ISustainabilityPerformanceTargetRate.sol";
// solhint-enable max-line-length
import { _CORPORATE_ACTION_ROLE } from "../../../constants/roles.sol";
import { SustainabilityPerformanceTargetRateDataStorage } from "../../../storage/ScheduledStorage.sol";
import { LibBond } from "../LibBond.sol";
import { LibInterestRate } from "../LibInterestRate.sol";
import { LibKpis } from "../LibKpis.sol";
import { LibProceedRecipients } from "../LibProceedRecipients.sol";
import { LibPause } from "../../core/LibPause.sol";
import { LibAccess } from "../../core/LibAccess.sol";
import { LibCorporateActions } from "../../core/LibCorporateActions.sol";

/**
 * @title BondSptRateLib
 * @notice External library for Sustainability Performance Target (SPT) Rate bond coupon operations
 * @dev Executes via DELEGATECALL from BondUSAFacet/BondUSAReadFacet - operates on Diamond storage
 *
 * Phase 2 of Bond Domain Unification ADR:
 * - Extracted from BondUSA._setCouponSpt() and _calculateSustainabilityRate()
 * - Deployed as external library to reduce facet bytecode size
 * - Handles both write (setCoupon) and read (calculateSustainabilityRate) operations
 */
library BondSptRateLib {
    // ═══════════════════════════════════════════════════════════════════════════════
    // ERRORS
    // ═══════════════════════════════════════════════════════════════════════════════

    error InterestRateIsSustainabilityPerformanceTarget();
    error WrongTimestamp(uint256 timeStamp);

    // ═══════════════════════════════════════════════════════════════════════════════
    // SPT RATE COUPON CREATION
    // ═══════════════════════════════════════════════════════════════════════════════

    /**
     * @notice Create a new SPT rate coupon
     * @dev Rate is calculated dynamically on read based on sustainability performance data
     * @param _newCoupon Coupon data (rate params must be zero/PENDING)
     * @return couponID_ The ID of the created coupon
     *
     * Requirements:
     * - rateStatus must be PENDING
     * - rate and rateDecimals must be 0 (calculated dynamically)
     * - All timestamp validations must pass
     */
    function setCoupon(IBondRead.Coupon calldata _newCoupon) external returns (uint256 couponID_) {
        // Validate input: SPT rate must not be provided in the coupon data
        if (
            _newCoupon.rateStatus != IBondRead.RateCalculationStatus.PENDING ||
            _newCoupon.rate != 0 ||
            _newCoupon.rateDecimals != 0
        ) {
            revert InterestRateIsSustainabilityPerformanceTarget();
        }

        // Standard validations (pause, access control, dates, timestamps)
        LibPause.requireNotPaused();
        LibAccess.checkRole(_CORPORATE_ACTION_ROLE);
        LibCorporateActions.validateDates(_newCoupon.startDate, _newCoupon.endDate);
        LibCorporateActions.validateDates(_newCoupon.recordDate, _newCoupon.executionDate);
        LibCorporateActions.validateDates(_newCoupon.fixingDate, _newCoupon.executionDate);
        _requireValidTimestamp(_newCoupon.recordDate);
        _requireValidTimestamp(_newCoupon.fixingDate);

        // Store coupon in Diamond storage via LibBond
        bytes32 corporateActionID;
        (corporateActionID, couponID_) = LibBond.setCoupon(_newCoupon);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // SPT RATE CALCULATION (READ-SIDE)
    // ═══════════════════════════════════════════════════════════════════════════════

    /**
     * @notice Calculate sustainability performance target interest rate based on project impact data
     * @dev Called from getCoupon() to dynamically compute rate
     * @param _couponID The coupon ID (for accessing previous coupon fixing date)
     * @param _coupon   The coupon data structure
     * @return rate_ Calculated interest rate
     * @return rateDecimals_ Rate decimal precision
     */
    function calculateSustainabilityRate(
        uint256 _couponID,
        IBondRead.Coupon memory _coupon
    ) external view returns (uint256 rate_, uint8 rateDecimals_) {
        SustainabilityPerformanceTargetRateDataStorage storage sptRateStorage = LibInterestRate.getSustainabilityRate();

        // If fixing date is before start period, return start rate
        if (_coupon.fixingDate < sptRateStorage.startPeriod) {
            return (sptRateStorage.startRate, sptRateStorage.rateDecimals);
        }

        // Get base rate
        (uint256 baseRate, uint8 decimals) = LibInterestRate.getBaseRate();

        // Get previous fixing date
        uint256 periodStart = _getPreviousFixingDate(_couponID);

        // Gather impact data from all proceed recipients
        address[] memory projects = LibProceedRecipients.getProceedRecipients(
            0,
            LibProceedRecipients.getProceedRecipientsCount()
        );

        int256 totalRateAdjustment = 0;

        for (uint256 index = 0; index < projects.length; ) {
            address project = projects[index];

            ISustainabilityPerformanceTargetRate.ImpactData memory impactData = LibInterestRate
                .getSustainabilityImpactData(project);

            (uint256 value, bool exists) = LibKpis.getLatestKpiData(periodStart, _coupon.fixingDate, project);

            int256 adjustment = LibInterestRate.calculateRateAdjustment(impactData, value, exists);
            totalRateAdjustment += adjustment;

            unchecked {
                ++index;
            }
        }

        // Calculate final rate: base rate + total adjustments
        int256 finalRate = int256(baseRate) + totalRateAdjustment;
        if (finalRate < 0) {
            finalRate = 0;
        }

        return (uint256(finalRate), decimals);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // INTERNAL HELPERS
    // ═══════════════════════════════════════════════════════════════════════════════

    /**
     * @notice Get the fixing date of the previous coupon
     * @param _couponID Current coupon ID
     * @return fixingDate_ Previous coupon fixing date
     */
    function _getPreviousFixingDate(uint256 _couponID) private view returns (uint256 fixingDate_) {
        uint256 previousCouponId = LibBond.getPreviousCouponInOrderedList(_couponID, block.timestamp);

        if (previousCouponId == 0) {
            return 0;
        }

        IBondRead.Coupon memory previousCoupon = LibBond.getCoupon(previousCouponId).coupon;
        return previousCoupon.fixingDate;
    }

    /**
     * @dev Validates that timestamp is in the future
     * @param _timestamp The timestamp to validate
     */
    function _requireValidTimestamp(uint256 _timestamp) private view {
        if (_timestamp <= block.timestamp) {
            revert WrongTimestamp(_timestamp);
        }
    }
}
