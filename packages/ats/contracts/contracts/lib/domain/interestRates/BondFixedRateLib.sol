// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBondRead } from "../../../facets/assetCapabilities/interfaces/bond/IBondRead.sol";
import { _CORPORATE_ACTION_ROLE } from "../../../constants/roles.sol";
import { LibBond } from "../LibBond.sol";
import { LibInterestRate } from "../LibInterestRate.sol";
import { LibPause } from "../../core/LibPause.sol";
import { LibAccess } from "../../core/LibAccess.sol";
import { LibCorporateActions } from "../../core/LibCorporateActions.sol";

/**
 * @title BondFixedRateLib
 * @notice External library for Fixed Rate bond coupon operations
 * @dev Executes via DELEGATECALL from BondUSAFacet - operates on Diamond storage
 *
 * Phase 2 of Bond Domain Unification ADR:
 * - Extracted from BondUSA._setCouponFixed() internal function
 * - Deployed as external library to reduce BondUSAFacet bytecode size
 * - Target: ~11.6 KB facet size (down from ~18 KB with internal libs)
 */
library BondFixedRateLib {
    // ═══════════════════════════════════════════════════════════════════════════════
    // ERRORS
    // ═══════════════════════════════════════════════════════════════════════════════

    error InterestRateIsFixed();
    error WrongTimestamp(uint256 timeStamp);

    // ═══════════════════════════════════════════════════════════════════════════════
    // FIXED RATE COUPON CREATION
    // ═══════════════════════════════════════════════════════════════════════════════

    /**
     * @notice Create a new fixed-rate coupon
     * @dev Fixed rate is retrieved from storage and injected into the coupon
     * @param _newCoupon Coupon data (rate params must be zero/PENDING)
     * @return couponID_ The ID of the created coupon
     *
     * Requirements:
     * - rateStatus must be PENDING
     * - rate and rateDecimals must be 0 (fixed rate comes from storage)
     * - All timestamp validations must pass
     */
    function setCoupon(IBondRead.Coupon calldata _newCoupon) external returns (uint256 couponID_) {
        // Validate input: fixed rate must not be provided in the coupon data
        if (
            _newCoupon.rateStatus != IBondRead.RateCalculationStatus.PENDING ||
            _newCoupon.rate != 0 ||
            _newCoupon.rateDecimals != 0
        ) {
            revert InterestRateIsFixed();
        }

        // Retrieve stored fixed rate
        (uint256 rate_, uint8 decimals_) = LibInterestRate.getFixedRate();

        // Construct modified coupon with injected fixed rate
        IBondRead.Coupon memory modifiedCoupon = IBondRead.Coupon({
            recordDate: _newCoupon.recordDate,
            executionDate: _newCoupon.executionDate,
            rate: rate_,
            rateDecimals: decimals_,
            startDate: _newCoupon.startDate,
            endDate: _newCoupon.endDate,
            fixingDate: _newCoupon.fixingDate,
            rateStatus: IBondRead.RateCalculationStatus.SET
        });

        // Standard validations (pause, access control, dates, timestamps)
        LibPause.requireNotPaused();
        LibAccess.checkRole(_CORPORATE_ACTION_ROLE);
        LibCorporateActions.validateDates(modifiedCoupon.startDate, modifiedCoupon.endDate);
        LibCorporateActions.validateDates(modifiedCoupon.recordDate, modifiedCoupon.executionDate);
        LibCorporateActions.validateDates(modifiedCoupon.fixingDate, modifiedCoupon.executionDate);
        _requireValidTimestamp(modifiedCoupon.recordDate);
        _requireValidTimestamp(modifiedCoupon.fixingDate);

        // Store coupon in Diamond storage via LibBond
        bytes32 corporateActionID;
        (corporateActionID, couponID_) = LibBond.setCoupon(modifiedCoupon);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // INTERNAL HELPERS
    // ═══════════════════════════════════════════════════════════════════════════════

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
