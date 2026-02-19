// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _BOND_FIXED_RATE_RESOLVER_KEY } from "../../../../constants/resolverKeys/assets.sol";
import { BondUSAFacetBase } from "../BondUSAFacetBase.sol";
import { IBondRead } from "../../../assetCapabilities/interfaces/bond/IBondRead.sol";
import { LibBond } from "../../../../lib/domain/LibBond.sol";
import { LibInterestRate } from "../../../../lib/domain/LibInterestRate.sol";
import { LibPause } from "../../../../lib/core/LibPause.sol";
import { LibAccess } from "../../../../lib/core/LibAccess.sol";
import { LibCorporateActions } from "../../../../lib/core/LibCorporateActions.sol";
import { _CORPORATE_ACTION_ROLE } from "../../../../constants/roles.sol";

contract BondUSAFixedRateFacet is BondUSAFacetBase {
    // ═══════════════════════════════════════════════════════════════════════════════
    // ERROR DEFINITIONS
    // ═══════════════════════════════════════════════════════════════════════════════

    error InterestRateIsFixed();

    // ═══════════════════════════════════════════════════════════════════════════════
    // COUPON MANAGEMENT (OVERRIDE)
    // ═══════════════════════════════════════════════════════════════════════════════

    function setCoupon(IBondRead.Coupon calldata _newCoupon) external override returns (uint256 couponID_) {
        // Validate that coupon rate parameters are appropriate for fixed-rate bond
        if (
            _newCoupon.rateStatus != IBondRead.RateCalculationStatus.PENDING ||
            _newCoupon.rate != 0 ||
            _newCoupon.rateDecimals != 0
        ) {
            revert InterestRateIsFixed();
        }

        // Get the fixed rate from storage
        (uint256 rate_, uint8 decimals_) = LibInterestRate.getFixedRate();

        // Create a modified coupon with the fixed rate and call parent implementation
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

        // Delegate to parent implementation via library functions (matching base behavior)
        couponID_ = _setCouponWithModifiedCoupon(modifiedCoupon);
    }

    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _BOND_FIXED_RATE_RESOLVER_KEY;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // PRIVATE STATE-CHANGING FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════════════

    function _setCouponWithModifiedCoupon(IBondRead.Coupon memory _newCoupon) private returns (uint256 couponID_) {
        // Import the same validation as BondUSAFacetBase (replicate parent logic)
        LibPause.requireNotPaused();
        LibAccess.checkRole(_CORPORATE_ACTION_ROLE);
        LibCorporateActions.validateDates(_newCoupon.startDate, _newCoupon.endDate);
        LibCorporateActions.validateDates(_newCoupon.recordDate, _newCoupon.executionDate);
        LibCorporateActions.validateDates(_newCoupon.fixingDate, _newCoupon.executionDate);
        _requireValidTimestamp(_newCoupon.recordDate);
        _requireValidTimestamp(_newCoupon.fixingDate);

        bytes32 corporateActionID;
        (corporateActionID, couponID_) = LibBond.setCoupon(_newCoupon);
    }
}
