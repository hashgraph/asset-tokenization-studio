// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBondRead } from "contracts/layer_2/interfaces/bond/IBondRead.sol";
import {
    ISustainabilityPerformanceTargetRate
} from "contracts/layer_2/interfaces/interestRates/sustainabilityPerformanceTargetRate/ISustainabilityPerformanceTargetRate.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { DecimalsLib } from "contracts/layer_0/common/libraries/DecimalsLib.sol";
import { KpisStorageWrapper } from "../kpis/KpisStorageWrapper.sol";
import { Internals } from "contracts/layer_0/Internals.sol";
import { BondStorageWrapper } from "contracts/layer_0/bond/BondStorageWrapper.sol";

abstract contract BondStorageWrapperSustainabilityPerformanceTargetInterestRate is KpisStorageWrapper {
    using EnumerableSet for EnumerableSet.Bytes32Set;

    error InterestRateIsSustainabilityPerformanceTarget();

    function _setCoupon(
        IBondRead.Coupon memory _newCoupon
    ) internal virtual override(Internals, BondStorageWrapper) returns (bytes32 corporateActionId_, uint256 couponID_) {
        _checkCoupon(_newCoupon, InterestRateIsSustainabilityPerformanceTarget.selector, "");

        return super._setCoupon(_newCoupon);
    }

    function _addToCouponsOrderedList(uint256 _couponID) internal virtual override {
        super._addToCouponsOrderedList(_couponID);
        _setSustainabilityPerformanceTargetInterestRate(_couponID);
    }

    function _setSustainabilityPerformanceTargetInterestRate(uint256 _couponID) internal override {
        IBondRead.Coupon memory coupon = _getCoupon(_couponID).coupon;

        (uint256 rate, uint8 rateDecimals) = _calculateSustainabilityPerformanceTargetInterestRate(_couponID, coupon);

        _updateCouponRate(_couponID, coupon, rate, rateDecimals);
    }

    function _getCoupon(
        uint256 _couponID
    )
        internal
        view
        virtual
        override(Internals, BondStorageWrapper)
        returns (IBondRead.RegisteredCoupon memory registeredCoupon_)
    {
        return _getCouponAdjusted(_couponID, _calculateSustainabilityPerformanceTargetInterestRate);
    }

    function _calculateSustainabilityPerformanceTargetInterestRate(
        uint256 /*_couponID*/,
        IBondRead.Coupon memory /*_coupon*/
    ) internal view override returns (uint256 rate_, uint8 rateDecimals) {
        return (0, 0);
        /*SustainabilityPerformanceTargetRateDataStorage
            memory sustainabilityPerformanceTargetRateStorage = _sustainabilityPerformanceTargetRateStorage();

        if (_coupon.fixingDate < sustainabilityPerformanceTargetRateStorage.startPeriod) {
            return (
                sustainabilityPerformanceTargetRateStorage.startRate,
                sustainabilityPerformanceTargetRateStorage.rateDecimals
            );
        }

        if (sustainabilityPerformanceTargetRateStorage.kpiOracle == address(0)) {
            return (
                sustainabilityPerformanceTargetRateStorage.baseRate,
                sustainabilityPerformanceTargetRateStorage.rateDecimals
            );
        }

        (uint256 impactData, bool reportFound) = abi.decode(
            sustainabilityPerformanceTargetRateStorage.kpiOracle.functionStaticCall(
                abi.encodeWithSelector(
                    IKpi.getKpiData.selector,
                    _coupon.fixingDate - sustainabilityPerformanceTargetRateStorage.reportPeriod,
                    _coupon.fixingDate
                ),
                ISustainabilityPerformanceTargetRate.KpiOracleCalledFailed.selector
            ),
            (uint256, bool)
        );

        uint256 rate;

        if (!reportFound) {
            (uint256 previousRate, uint8 previousRateDecimals) = _previousRate(_couponID);

            previousRate = DecimalsLib.calculateDecimalsAdjustment(
                previousRate,
                previousRateDecimals,
                sustainabilityPerformanceTargetRateStorage.rateDecimals
            );

            rate = previousRate + sustainabilityPerformanceTargetRateStorage.missedPenalty;

            if (rate > sustainabilityPerformanceTargetRateStorage.maxRate)
                rate = sustainabilityPerformanceTargetRateStorage.maxRate;

            return (rate, sustainabilityPerformanceTargetRateStorage.rateDecimals);
        }

        uint256 impactDeltaRate;
        uint256 factor = 10 ** sustainabilityPerformanceTargetRateStorage.adjustmentPrecision;

        if (sustainabilityPerformanceTargetRateStorage.baseLine > impactData) {
            impactDeltaRate =
                (factor * (sustainabilityPerformanceTargetRateStorage.baseLine - impactData)) /
                (sustainabilityPerformanceTargetRateStorage.baseLine -
                    sustainabilityPerformanceTargetRateStorage.maxDeviationFloor);
            if (impactDeltaRate > factor) impactDeltaRate = factor;
            rate =
                sustainabilityPerformanceTargetRateStorage.baseRate -
                (((sustainabilityPerformanceTargetRateStorage.baseRate -
                    sustainabilityPerformanceTargetRateStorage.minRate) * impactDeltaRate) / factor);
        } else {
            impactDeltaRate =
                (factor * (impactData - sustainabilityPerformanceTargetRateStorage.baseLine)) /
                (sustainabilityPerformanceTargetRateStorage.maxDeviationCap -
                    sustainabilityPerformanceTargetRateStorage.baseLine);
            if (impactDeltaRate > factor) impactDeltaRate = factor;
            rate =
                sustainabilityPerformanceTargetRateStorage.baseRate +
                (((sustainabilityPerformanceTargetRateStorage.maxRate -
                    sustainabilityPerformanceTargetRateStorage.baseRate) * impactDeltaRate) / factor);
        }

        return (rate, sustainabilityPerformanceTargetRateStorage.rateDecimals);*/
    }

    /*function _previousRate(uint256 _couponID) internal view returns (uint256 rate_, uint8 rateDecimals_) {
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
            return _calculateSustainabilityPerformanceTargetInterestRate(previousCouponId, previousCoupon);
        }
        return (previousCoupon.rate, previousCoupon.rateDecimals);
    }*/
}
