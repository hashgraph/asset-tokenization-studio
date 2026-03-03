// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBondRead } from "../../../facets/assetCapabilities/interfaces/bond/IBondRead.sol";
import { _CORPORATE_ACTION_ROLE } from "../../../constants/roles.sol";
import { KpiLinkedRateDataStorage } from "../../../storage/ScheduledStorage.sol";
import { LibBond } from "../LibBond.sol";
import { LibInterestRate } from "../LibInterestRate.sol";
import { LibKpis } from "../LibKpis.sol";
import { LibProceedRecipients } from "../LibProceedRecipients.sol";
import { LibPause } from "../../core/LibPause.sol";
import { LibAccess } from "../../core/LibAccess.sol";
import { LibCorporateActions } from "../../core/LibCorporateActions.sol";

/**
 * @title BondKpiLinkedRateLib
 * @notice External library for KPI-Linked Rate bond coupon operations
 * @dev Executes via DELEGATECALL from BondUSAFacet/BondUSAReadFacet - operates on Diamond storage
 *
 * Phase 2 of Bond Domain Unification ADR:
 * - Extracted from BondUSA._setCouponKpiLinked() and _calculateKpiLinkedInterestRate()
 * - Deployed as external library to reduce facet bytecode size
 * - Handles both write (setCoupon) and read (calculateInterestRate) operations
 */
library BondKpiLinkedRateLib {
    // ═══════════════════════════════════════════════════════════════════════════════
    // ERRORS
    // ═══════════════════════════════════════════════════════════════════════════════

    error InterestRateIsKpiLinked();
    error WrongTimestamp(uint256 timeStamp);

    // ═══════════════════════════════════════════════════════════════════════════════
    // KPI-LINKED RATE COUPON CREATION
    // ═══════════════════════════════════════════════════════════════════════════════

    /**
     * @notice Create a new KPI-linked rate coupon
     * @dev Rate is calculated dynamically on read based on KPI data
     * @param _newCoupon Coupon data (rate params must be zero/PENDING)
     * @return couponID_ The ID of the created coupon
     *
     * Requirements:
     * - rateStatus must be PENDING
     * - rate and rateDecimals must be 0 (calculated dynamically)
     * - All timestamp validations must pass
     */
    function setCoupon(IBondRead.Coupon calldata _newCoupon) external returns (uint256 couponID_) {
        // Validate input: KPI-linked rate must not be provided in the coupon data
        if (
            _newCoupon.rateStatus != IBondRead.RateCalculationStatus.PENDING ||
            _newCoupon.rate != 0 ||
            _newCoupon.rateDecimals != 0
        ) {
            revert InterestRateIsKpiLinked();
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
    // KPI-LINKED RATE CALCULATION (READ-SIDE)
    // ═══════════════════════════════════════════════════════════════════════════════

    /**
     * @notice Calculate KPI-linked interest rate based on impact data
     * @dev Called from getCoupon() to dynamically compute rate
     * @param _couponID The coupon ID (for accessing previous coupon rate)
     * @param _coupon   The coupon data structure
     * @return rate_ Calculated interest rate
     * @return rateDecimals_ Rate decimal precision
     */
    function calculateInterestRate(
        uint256 _couponID,
        IBondRead.Coupon memory _coupon
    ) external view returns (uint256 rate_, uint8 rateDecimals_) {
        KpiLinkedRateDataStorage storage kpiLinkedRateStorage = LibInterestRate.getKpiLinkedRate();

        // If fixing date is before start period, return start rate
        if (_coupon.fixingDate < kpiLinkedRateStorage.startPeriod) {
            return (kpiLinkedRateStorage.startRate, kpiLinkedRateStorage.rateDecimals);
        }

        // Gather impact data from all proceed recipients
        address[] memory projects = LibProceedRecipients.getProceedRecipients(
            0,
            LibProceedRecipients.getProceedRecipientsCount()
        );
        uint256 impactData = 0;
        bool reportFound = false;

        for (uint256 index = 0; index < projects.length; ) {
            (uint256 value, bool exists) = LibKpis.getLatestKpiData(
                _coupon.fixingDate - kpiLinkedRateStorage.reportPeriod,
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

        // Get previous coupon rate for calculation
        (uint256 previousRate, uint8 previousRateDecimals) = _getPreviousCouponRate(_couponID);

        // Calculate KPI-linked rate using LibInterestRate
        return LibInterestRate.calculateKpiLinkedRate(impactData, previousRate, previousRateDecimals, reportFound);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // INTERNAL HELPERS
    // ═══════════════════════════════════════════════════════════════════════════════

    /**
     * @notice Get the rate and decimals of the previous coupon
     * @dev Recursively retrieves previous coupon rate through getCoupon
     * @param _couponID Current coupon ID
     * @return rate_ Previous coupon rate
     * @return rateDecimals_ Previous coupon rate decimals
     */
    function _getPreviousCouponRate(uint256 _couponID) private view returns (uint256 rate_, uint8 rateDecimals_) {
        uint256 previousCouponId = LibBond.getPreviousCouponInOrderedList(_couponID, block.timestamp);

        if (previousCouponId == 0) {
            return (0, 0);
        }

        // Recursively get the previous coupon through getCoupon to ensure rate is calculated
        IBondRead.RegisteredCoupon memory previousCoupon = IBondRead(address(this)).getCoupon(previousCouponId);

        if (previousCoupon.coupon.rateStatus == IBondRead.RateCalculationStatus.SET) {
            return (previousCoupon.coupon.rate, previousCoupon.coupon.rateDecimals);
        }

        return (0, 0);
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
