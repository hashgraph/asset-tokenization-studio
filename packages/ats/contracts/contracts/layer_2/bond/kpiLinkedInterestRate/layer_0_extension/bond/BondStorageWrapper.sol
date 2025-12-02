// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { Common } from "../../../../../layer_1/common/Common.sol";
import { IBondRead } from "../../../../interfaces/bond/IBondRead.sol";
import { COUPON_LISTING_TASK_TYPE, COUPON_CORPORATE_ACTION_TYPE } from "../../../../../layer_0/constants/values.sol";
import { IKpi } from "../../../../interfaces/interestRates/kpiLinkedRate/IKpi.sol";
import { IKpiLinkedRate } from "../../../../interfaces/interestRates/kpiLinkedRate/IKpiLinkedRate.sol";
import { LowLevelCall } from "../../../../../layer_0/common/libraries/LowLevelCall.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { DecimalsLib } from "../../../../../layer_0/common/libraries/DecimalsLib.sol";

abstract contract BondStorageWrapperKpiLinkedInterestRate is Common {
    using LowLevelCall for address;
    using EnumerableSet for EnumerableSet.Bytes32Set;

    error InterestRateIsKpiLinked();

    function _setCoupon(
        IBondRead.Coupon memory _newCoupon
    ) internal virtual override returns (bytes32 corporateActionId_, uint256 couponID_) {
        if (
            _newCoupon.rateStatus != IBondRead.RateCalculationStatus.PENDING ||
            _newCoupon.rate != 0 ||
            _newCoupon.rateDecimals != 0
        ) revert InterestRateIsKpiLinked();

        return super._setCoupon(_newCoupon);
    }

    function _initCoupon(bytes32 _actionId, IBondRead.Coupon memory _newCoupon) internal virtual override {
        super._initCoupon(_actionId, _newCoupon);

        _addScheduledCrossOrderedTask(_newCoupon.fixingDate, abi.encode(COUPON_LISTING_TASK_TYPE));
        _addScheduledCouponListing(_newCoupon.fixingDate, abi.encode(_actionId));
    }

    function _addToCouponsOrderedList(uint256 _couponID) internal virtual override {
        super._addToCouponsOrderedList(_couponID);
        _setKpiLinkedInterestRate(_couponID);
    }

    function _setKpiLinkedInterestRate(uint256 _couponID) internal {
        IBondRead.Coupon memory coupon = _getCoupon(_couponID).coupon;

        (uint256 rate, uint8 rateDecimals) = _calculateKpiLinkedInterestRate(_couponID, coupon);

        _updateCouponRate(_couponID, coupon, rate, rateDecimals);
    }

    function _updateCouponRate(
        uint256 _couponID,
        IBondRead.Coupon memory _coupon,
        uint256 _rate,
        uint8 _rateDecimals
    ) internal virtual {
        bytes32 actionId = _getCorporateActionIdByTypeIndex(COUPON_CORPORATE_ACTION_TYPE, _couponID - 1);

        _coupon.rate = _rate;
        _coupon.rateDecimals = _rateDecimals;
        _coupon.rateStatus = IBondRead.RateCalculationStatus.SET;

        _updateCorporateActionData(actionId, abi.encode(_coupon));
    }

    function _getCoupon(
        uint256 _couponID
    ) internal view virtual override returns (IBondRead.RegisteredCoupon memory registeredCoupon_) {
        registeredCoupon_ = super._getCoupon(_couponID);

        if (registeredCoupon_.coupon.rateStatus == IBondRead.RateCalculationStatus.SET) return registeredCoupon_;

        if (registeredCoupon_.coupon.fixingDate > _blockTimestamp()) return registeredCoupon_;

        (registeredCoupon_.coupon.rate, registeredCoupon_.coupon.rateDecimals) = _calculateKpiLinkedInterestRate(
            _couponID,
            registeredCoupon_.coupon
        );
        registeredCoupon_.coupon.rateStatus = IBondRead.RateCalculationStatus.SET;
    }

    function _calculateKpiLinkedInterestRate(
        uint256 _couponID,
        IBondRead.Coupon memory _coupon
    ) internal view returns (uint256 rate_, uint8 rateDecimals) {
        KpiLinkedRateDataStorage memory kpiLinkedRateStorage = _kpiLinkedRateStorage();

        if (_coupon.fixingDate < kpiLinkedRateStorage.startPeriod) {
            return (kpiLinkedRateStorage.startRate, kpiLinkedRateStorage.rateDecimals);
        }

        if (kpiLinkedRateStorage.kpiOracle == address(0)) {
            return (kpiLinkedRateStorage.baseRate, kpiLinkedRateStorage.rateDecimals);
        }

        (uint256 impactData, bool reportFound) = abi.decode(
            kpiLinkedRateStorage.kpiOracle.functionStaticCall(
                abi.encodeWithSelector(
                    IKpi.getKpiData.selector,
                    _coupon.fixingDate - kpiLinkedRateStorage.reportPeriod,
                    _coupon.fixingDate
                ),
                IKpiLinkedRate.KpiOracleCalledFailed.selector
            ),
            (uint256, bool)
        );

        uint256 rate;

        if (!reportFound) {
            (uint256 previousRate, uint8 previousRateDecimals) = _previousRate(_couponID);

            previousRate = DecimalsLib.calculateDecimalsAdjustment(
                previousRate,
                previousRateDecimals,
                kpiLinkedRateStorage.rateDecimals
            );

            rate = previousRate + kpiLinkedRateStorage.missedPenalty;

            if (rate > kpiLinkedRateStorage.maxRate) rate = kpiLinkedRateStorage.maxRate;

            return (rate, kpiLinkedRateStorage.rateDecimals);
        }

        uint256 impactDeltaRate;
        uint256 factor = 10 ** kpiLinkedRateStorage.adjustmentPrecision;

        if (kpiLinkedRateStorage.baseLine > impactData) {
            impactDeltaRate =
                (factor * (kpiLinkedRateStorage.baseLine - impactData)) /
                (kpiLinkedRateStorage.baseLine - kpiLinkedRateStorage.maxDeviationFloor);
            if (impactDeltaRate > factor) impactDeltaRate = factor;
            rate =
                kpiLinkedRateStorage.baseRate -
                (((kpiLinkedRateStorage.baseRate - kpiLinkedRateStorage.minRate) * impactDeltaRate) / factor);
        } else {
            impactDeltaRate =
                (factor * (impactData - kpiLinkedRateStorage.baseLine)) /
                (kpiLinkedRateStorage.maxDeviationCap - kpiLinkedRateStorage.baseLine);
            if (impactDeltaRate > factor) impactDeltaRate = factor;
            rate =
                kpiLinkedRateStorage.baseRate +
                (((kpiLinkedRateStorage.maxRate - kpiLinkedRateStorage.baseRate) * impactDeltaRate) / factor);
        }

        return (rate, kpiLinkedRateStorage.rateDecimals);
    }

    function _previousRate(uint256 _couponID) internal view returns (uint256 rate_, uint8 rateDecimals_) {
        uint256 orderedListLength = _getCouponsOrderedListTotalAdjusted();

        if (orderedListLength < 2) return (0, 0);

        if (_getCouponFromOrderedListAt(0) == _couponID) return (0, 0);

        orderedListLength--;
        uint256 previousCouponId;

        for (uint256 index = 0; index < orderedListLength; index++) {
            previousCouponId = _getCouponFromOrderedListAt(index);
            uint256 couponId = _getCouponFromOrderedListAt(index + 1);
            if (couponId == _couponID) break;
        }

        IBondRead.Coupon memory previousCoupon = _getCoupon(previousCouponId).coupon;

        if (previousCoupon.rateStatus != IBondRead.RateCalculationStatus.SET) {
            return _calculateKpiLinkedInterestRate(previousCouponId, previousCoupon);
        }
        return (previousCoupon.rate, previousCoupon.rateDecimals);
    }
}
