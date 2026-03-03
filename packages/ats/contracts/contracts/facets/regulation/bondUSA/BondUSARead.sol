// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBondRead } from "../../assetCapabilities/interfaces/bond/IBondRead.sol";
import { ISecurity } from "../interfaces/ISecurity.sol";
import { COUPON_CORPORATE_ACTION_TYPE } from "../../../constants/values.sol";
// solhint-disable max-line-length
import {
    ISustainabilityPerformanceTargetRate
} from "../../assetCapabilities/interfaces/interestRates/sustainabilityPerformanceTargetRate/ISustainabilityPerformanceTargetRate.sol";
// solhint-enable max-line-length

import { BondRateType, bondStorage } from "../../../storage/AssetStorage.sol";
import {
    KpiLinkedRateDataStorage,
    SustainabilityPerformanceTargetRateDataStorage
} from "../../../storage/ScheduledStorage.sol";
import { LibBond } from "../../../lib/domain/LibBond.sol";
import { LibSecurity } from "../../../lib/domain/LibSecurity.sol";
import { LibABAF } from "../../../lib/domain/LibABAF.sol";
import { LibSnapshots } from "../../../lib/domain/LibSnapshots.sol";
import { LibERC1410 } from "../../../lib/domain/LibERC1410.sol";
import { LibCorporateActions } from "../../../lib/core/LibCorporateActions.sol";
import { LibInterestRate } from "../../../lib/domain/LibInterestRate.sol";
import { LibKpis } from "../../../lib/domain/LibKpis.sol";
import { LibProceedRecipients } from "../../../lib/domain/LibProceedRecipients.sol";
import { HoldOps } from "../../../lib/orchestrator/HoldOps.sol";
import { TimestampProvider } from "../../../infrastructure/lib/TimestampProvider.sol";

abstract contract BondUSARead is IBondRead, ISecurity, TimestampProvider {
    // ═══════════════════════════════════════════════════════════════════════════════
    // BOND DETAILS
    // ═══════════════════════════════════════════════════════════════════════════════

    function getBondDetails() external view override returns (BondDetailsData memory bondDetailsData_) {
        return LibBond.getBondDetails();
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // COUPON QUERIES
    // ═══════════════════════════════════════════════════════════════════════════════

    function getCoupon(
        uint256 _couponID
    ) external view virtual override returns (RegisteredCoupon memory registeredCoupon_) {
        LibCorporateActions.validateMatchingActionType(COUPON_CORPORATE_ACTION_TYPE, _couponID - 1);

        registeredCoupon_ = LibBond.getCoupon(_couponID);

        // Dispatch dynamic rate calculation based on stored rate type
        BondRateType rateType = bondStorage().rateType;

        if (rateType == BondRateType.KpiLinked) {
            registeredCoupon_ = _applyCouponKpiLinkedRate(_couponID, registeredCoupon_);
        } else if (rateType == BondRateType.Spt) {
            registeredCoupon_ = _applyCouponSptRate(_couponID, registeredCoupon_);
        }
        // Variable and Fixed rate coupons: rate is already stored; return as-is.
    }

    function getCouponFor(
        uint256 _couponID,
        address _account
    ) external view override returns (CouponFor memory couponFor_) {
        LibCorporateActions.validateMatchingActionType(COUPON_CORPORATE_ACTION_TYPE, _couponID - 1);
        return _getCouponFor(_couponID, _account);
    }

    function getCouponAmountFor(
        uint256 _couponID,
        address _account
    ) external view override returns (CouponAmountFor memory couponAmountFor_) {
        LibCorporateActions.validateMatchingActionType(COUPON_CORPORATE_ACTION_TYPE, _couponID - 1);
        return _getCouponAmountFor(_couponID, _account);
    }

    function getCouponCount() external view override returns (uint256 couponCount_) {
        return LibBond.getCouponCount();
    }

    function getCouponHolders(
        uint256 _couponID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (address[] memory holders_) {
        return _getCouponHolders(_couponID, _pageIndex, _pageLength);
    }

    function getTotalCouponHolders(uint256 _couponID) external view override returns (uint256) {
        return _getTotalCouponHolders(_couponID);
    }

    function getPrincipalFor(address _account) external view override returns (PrincipalFor memory principalFor_) {
        return _getPrincipalFor(_account);
    }

    function getCouponFromOrderedListAt(uint256 _pos) external view override returns (uint256 couponID_) {
        return LibBond.getCouponFromOrderedListAt(_pos, _getBlockTimestamp());
    }

    function getCouponsOrderedList(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (uint256[] memory couponIDs_) {
        return LibBond.getCouponsOrderedList(_pageIndex, _pageLength, _getBlockTimestamp());
    }

    function getCouponsOrderedListTotal() external view override returns (uint256 total_) {
        return LibBond.getCouponsOrderedListTotalAdjustedAt(_getBlockTimestamp());
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // SECURITY QUERIES
    // ═══════════════════════════════════════════════════════════════════════════════

    function getSecurityHolders(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (address[] memory) {
        return LibERC1410.getTokenHolders(_pageIndex, _pageLength);
    }

    function getTotalSecurityHolders() external view override returns (uint256) {
        return LibERC1410.getTotalTokenHolders();
    }

    function getSecurityRegulationData() external pure override returns (ISecurity.SecurityRegulationData memory) {
        return LibSecurity.getSecurityRegulationData();
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // INTERNAL HELPERS
    // ═══════════════════════════════════════════════════════════════════════════════

    function _getCouponFor(
        uint256 _couponID,
        address _account
    ) internal view returns (IBondRead.CouponFor memory couponFor_) {
        IBondRead.RegisteredCoupon memory registeredCoupon = this.getCoupon(_couponID);
        couponFor_.coupon = registeredCoupon.coupon;

        if (registeredCoupon.coupon.recordDate < _getBlockTimestamp()) {
            couponFor_.recordDateReached = true;
            couponFor_.tokenBalance = (registeredCoupon.snapshotId != 0)
                ? LibSnapshots.totalBalanceOfAtSnapshot(registeredCoupon.snapshotId, _account)
                : HoldOps.getTotalBalanceForAdjustedAt(_account, _getBlockTimestamp());
            couponFor_.decimals = (registeredCoupon.snapshotId != 0)
                ? LibSnapshots.decimalsAtSnapshot(registeredCoupon.snapshotId, _getBlockTimestamp())
                : LibSnapshots.decimalsAdjustedAt(_getBlockTimestamp());
        }
    }

    function _getCouponAmountFor(
        uint256 _couponID,
        address _account
    ) internal view returns (IBondRead.CouponAmountFor memory couponAmountFor_) {
        IBondRead.CouponFor memory couponFor = _getCouponFor(_couponID, _account);

        if (!couponFor.recordDateReached) return couponAmountFor_;

        IBondRead.BondDetailsData memory bondDetails = LibBond.getBondDetails();

        couponAmountFor_.recordDateReached = true;

        uint256 period = couponFor.coupon.endDate - couponFor.coupon.startDate;

        couponAmountFor_.numerator = couponFor.tokenBalance * bondDetails.nominalValue * couponFor.coupon.rate * period;
        couponAmountFor_.denominator =
            10 ** (couponFor.decimals + bondDetails.nominalValueDecimals + couponFor.coupon.rateDecimals) *
            365 days;
    }

    function _getPrincipalFor(address _account) internal view returns (IBondRead.PrincipalFor memory principalFor_) {
        IBondRead.BondDetailsData memory bondDetails = LibBond.getBondDetails();

        principalFor_.numerator =
            LibABAF.balanceOfAdjustedAt(_account, _getBlockTimestamp()) *
            bondDetails.nominalValue;
        principalFor_.denominator =
            10 ** (LibSnapshots.decimalsAdjustedAt(_getBlockTimestamp()) + bondDetails.nominalValueDecimals);
    }

    function _getCouponHolders(
        uint256 _couponID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (address[] memory holders_) {
        IBondRead.RegisteredCoupon memory registeredCoupon = LibBond.getCoupon(_couponID);

        if (registeredCoupon.coupon.recordDate >= _getBlockTimestamp()) return new address[](0);

        if (registeredCoupon.snapshotId != 0) {
            return LibSnapshots.tokenHoldersAt(registeredCoupon.snapshotId, _pageIndex, _pageLength);
        }

        return LibERC1410.getTokenHolders(_pageIndex, _pageLength);
    }

    function _getTotalCouponHolders(uint256 _couponID) internal view returns (uint256) {
        IBondRead.RegisteredCoupon memory registeredCoupon = LibBond.getCoupon(_couponID);

        if (registeredCoupon.coupon.recordDate >= _getBlockTimestamp()) return 0;

        if (registeredCoupon.snapshotId != 0) {
            return LibSnapshots.totalTokenHoldersAt(registeredCoupon.snapshotId);
        }

        return LibERC1410.getTotalTokenHolders();
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // PRIVATE — RATE-SPECIFIC getCoupon DYNAMIC OVERRIDES
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @dev Applies KPI-linked rate calculation to a coupon if not yet set.
    function _applyCouponKpiLinkedRate(
        uint256 _couponID,
        IBondRead.RegisteredCoupon memory _registeredCoupon
    ) private view returns (IBondRead.RegisteredCoupon memory) {
        if (_registeredCoupon.coupon.rateStatus == IBondRead.RateCalculationStatus.SET) {
            return _registeredCoupon;
        }
        if (_registeredCoupon.coupon.fixingDate > _getBlockTimestamp()) {
            return _registeredCoupon;
        }

        (uint256 rate, uint8 rateDecimals) = _calculateKpiLinkedInterestRate(_couponID, _registeredCoupon.coupon);
        _registeredCoupon.coupon.rate = rate;
        _registeredCoupon.coupon.rateDecimals = rateDecimals;
        _registeredCoupon.coupon.rateStatus = IBondRead.RateCalculationStatus.SET;
        return _registeredCoupon;
    }

    /// @dev Applies SPT rate calculation to a coupon if not yet set.
    function _applyCouponSptRate(
        uint256 _couponID,
        IBondRead.RegisteredCoupon memory _registeredCoupon
    ) private view returns (IBondRead.RegisteredCoupon memory) {
        if (_registeredCoupon.coupon.rateStatus == IBondRead.RateCalculationStatus.SET) {
            return _registeredCoupon;
        }
        if (_registeredCoupon.coupon.fixingDate > _getBlockTimestamp()) {
            return _registeredCoupon;
        }

        (uint256 rate, uint8 rateDecimals) = _calculateSustainabilityRate(_couponID, _registeredCoupon.coupon);
        _registeredCoupon.coupon.rate = rate;
        _registeredCoupon.coupon.rateDecimals = rateDecimals;
        _registeredCoupon.coupon.rateStatus = IBondRead.RateCalculationStatus.SET;
        return _registeredCoupon;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // INTERNAL — KPI-LINKED RATE CALCULATION
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Calculate KPI-linked interest rate based on impact data
    // solhint-disable-next-line ordering
    function _calculateKpiLinkedInterestRate(
        uint256 _couponID,
        IBondRead.Coupon memory _coupon
    ) internal view returns (uint256 rate_, uint8 rateDecimals_) {
        KpiLinkedRateDataStorage storage kpiLinkedRateStorage = LibInterestRate.getKpiLinkedRate();

        if (_coupon.fixingDate < kpiLinkedRateStorage.startPeriod) {
            return (kpiLinkedRateStorage.startRate, kpiLinkedRateStorage.rateDecimals);
        }

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

        (uint256 previousRate, uint8 previousRateDecimals) = _getPreviousCouponRate(_couponID);

        return LibInterestRate.calculateKpiLinkedRate(impactData, previousRate, previousRateDecimals, reportFound);
    }

    /// @notice Get the rate and decimals of the previous coupon
    function _getPreviousCouponRate(uint256 _couponID) internal view returns (uint256 rate_, uint8 rateDecimals_) {
        uint256 previousCouponId = LibBond.getPreviousCouponInOrderedList(_couponID, _getBlockTimestamp());

        if (previousCouponId == 0) {
            return (0, 0);
        }

        IBondRead.RegisteredCoupon memory previousCoupon = this.getCoupon(previousCouponId);

        if (previousCoupon.coupon.rateStatus == IBondRead.RateCalculationStatus.SET) {
            return (previousCoupon.coupon.rate, previousCoupon.coupon.rateDecimals);
        }

        return (0, 0);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // INTERNAL — SPT RATE CALCULATION
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Calculate sustainability performance target interest rate based on project impact data
    function _calculateSustainabilityRate(
        uint256 _couponID,
        IBondRead.Coupon memory _coupon
    ) internal view returns (uint256 rate_, uint8 rateDecimals_) {
        SustainabilityPerformanceTargetRateDataStorage storage sptRateStorage = LibInterestRate.getSustainabilityRate();

        if (_coupon.fixingDate < sptRateStorage.startPeriod) {
            return (sptRateStorage.startRate, sptRateStorage.rateDecimals);
        }

        (uint256 baseRate, uint8 decimals) = LibInterestRate.getBaseRate();

        uint256 periodStart = _getPreviousFixingDate(_couponID);

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

        int256 finalRate = int256(baseRate) + totalRateAdjustment;
        if (finalRate < 0) {
            finalRate = 0;
        }

        return (uint256(finalRate), decimals);
    }

    /// @notice Get the fixing date of the previous coupon
    function _getPreviousFixingDate(uint256 _couponID) internal view returns (uint256 fixingDate_) {
        uint256 previousCouponId = LibBond.getPreviousCouponInOrderedList(_couponID, _getBlockTimestamp());

        if (previousCouponId == 0) {
            return 0;
        }

        IBondRead.Coupon memory previousCoupon = LibBond.getCoupon(previousCouponId).coupon;
        return previousCoupon.fixingDate;
    }
}
