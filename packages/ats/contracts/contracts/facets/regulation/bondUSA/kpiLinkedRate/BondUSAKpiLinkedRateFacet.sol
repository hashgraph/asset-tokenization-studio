// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _BOND_KPI_LINKED_RATE_RESOLVER_KEY } from "../../../../constants/resolverKeys/assets.sol";
import { BondUSA } from "../BondUSA.sol";
import { IStaticFunctionSelectors } from "../../../../infrastructure/interfaces/IStaticFunctionSelectors.sol";
import { IBond } from "../../../assetCapabilities/interfaces/bond/IBond.sol";
import { IBondRead } from "../../../assetCapabilities/interfaces/bond/IBondRead.sol";
import { IBondUSA } from "../../interfaces/IBondUSA.sol";
import { LibBond } from "../../../../lib/domain/LibBond.sol";
import { LibInterestRate } from "../../../../lib/domain/LibInterestRate.sol";
import { KpiLinkedRateDataStorage } from "../../../../storage/ScheduledStorage.sol";
import { LibKpis } from "../../../../lib/domain/LibKpis.sol";
import { LibProceedRecipients } from "../../../../lib/domain/LibProceedRecipients.sol";
import { LibPause } from "../../../../lib/core/LibPause.sol";
import { LibAccess } from "../../../../lib/core/LibAccess.sol";
import { LibCorporateActions } from "../../../../lib/core/LibCorporateActions.sol";
import { _CORPORATE_ACTION_ROLE } from "../../../../constants/roles.sol";
import { LibTimeTravel } from "../../../../test/timeTravel/LibTimeTravel.sol";

contract BondUSAKpiLinkedRateFacet is BondUSA, IStaticFunctionSelectors {
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

    function getCoupon(uint256 _couponID) external view returns (IBondRead.RegisteredCoupon memory registeredCoupon_) {
        // Get the base coupon from storage
        registeredCoupon_ = LibBond.getCoupon(_couponID);

        // Only calculate rate if:
        // 1. Rate hasn't been set yet (PENDING status), AND
        // 2. We've reached or passed the fixing date
        if (registeredCoupon_.coupon.rateStatus == IBondRead.RateCalculationStatus.SET) {
            return registeredCoupon_;
        }

        if (registeredCoupon_.coupon.fixingDate > LibTimeTravel.getBlockTimestamp()) {
            return registeredCoupon_;
        }

        // Calculate and update the KPI-linked interest rate dynamically
        (uint256 rate, uint8 rateDecimals) = _calculateKpiLinkedInterestRate(_couponID, registeredCoupon_.coupon);
        registeredCoupon_.coupon.rate = rate;
        registeredCoupon_.coupon.rateDecimals = rateDecimals;
        registeredCoupon_.coupon.rateStatus = IBondRead.RateCalculationStatus.SET;
        return registeredCoupon_;
    }

    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _BOND_KPI_LINKED_RATE_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](5);
        staticFunctionSelectors_[selectorIndex++] = this._initialize_bondUSA.selector;
        staticFunctionSelectors_[selectorIndex++] = this.setCoupon.selector;
        staticFunctionSelectors_[selectorIndex++] = this.updateMaturityDate.selector;
        staticFunctionSelectors_[selectorIndex++] = this.redeemAtMaturityByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.fullRedeemAtMaturity.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](2);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IBond).interfaceId;
        staticInterfaceIds_[selectorsIndex++] = type(IBondUSA).interfaceId;
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
        KpiLinkedRateDataStorage storage kpiLinkedRateStorage = LibInterestRate.getKpiLinkedRate();

        if (_coupon.fixingDate < kpiLinkedRateStorage.startPeriod) {
            return (kpiLinkedRateStorage.startRate, kpiLinkedRateStorage.rateDecimals);
        }

        // Aggregate KPI data from all proceed recipients
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

        // Get the previous coupon rate (if no coupon exists, returns 0)
        (uint256 previousRate, uint8 previousRateDecimals) = _getPreviousCouponRate(_couponID);

        // Calculate and return the rate
        return LibInterestRate.calculateKpiLinkedRate(impactData, previousRate, previousRateDecimals, reportFound);
    }

    /// @notice Get the rate and decimals of the previous coupon
    /// @param _couponID Current coupon ID (to find the previous one)
    /// @return rate_ The previous coupon rate
    /// @return rateDecimals_ The previous coupon rate decimals
    function _getPreviousCouponRate(uint256 _couponID) internal view returns (uint256 rate_, uint8 rateDecimals_) {
        uint256 previousCouponId = LibBond.getPreviousCouponInOrderedList(_couponID, LibTimeTravel.getBlockTimestamp());

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
