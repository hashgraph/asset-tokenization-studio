// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBondRead } from "../../../../../../layer_2/interfaces/bond/IBondRead.sol";
import { LowLevelCall } from "../../../../../../layer_0/common/libraries/LowLevelCall.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { DecimalsLib } from "../../../../../../layer_0/common/libraries/DecimalsLib.sol";
import { InternalsKpiLinkedInterestRate } from "../Internals.sol";
import { Internals } from "../../../../../../layer_0/Internals.sol";
import { BondStorageWrapper } from "../../../../../../layer_0/bond/BondStorageWrapper.sol";
import { ProceedRecipientsStorageWrapperKpiInterestRate } from "../../ProceedRecipientsStorageWrapper.sol";
import { KpisStorageWrapper } from "../../KpisStorageWrapper.sol";

abstract contract BondStorageWrapperKpiLinkedInterestRate is
    InternalsKpiLinkedInterestRate,
    ProceedRecipientsStorageWrapperKpiInterestRate
{
    using LowLevelCall for address;
    using EnumerableSet for EnumerableSet.Bytes32Set;

    error InterestRateIsKpiLinked();

    function _setCoupon(
        IBondRead.Coupon memory _newCoupon
    ) internal virtual override(Internals, BondStorageWrapper) returns (bytes32 corporateActionId_, uint256 couponID_) {
        _checkCoupon(_newCoupon, InterestRateIsKpiLinked.selector, "");

        return super._setCoupon(_newCoupon);
    }

    function _addToCouponsOrderedList(uint256 _couponID) internal virtual override(Internals, KpisStorageWrapper) {
        super._addToCouponsOrderedList(_couponID);
        _setKpiLinkedInterestRate(_couponID);
    }

    function _setKpiLinkedInterestRate(uint256 _couponID) internal override {
        IBondRead.Coupon memory coupon = _getCoupon(_couponID).coupon;

        (uint256 rate, uint8 rateDecimals) = _calculateKpiLinkedInterestRate(_couponID, coupon);

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
        return _getCouponAdjustedAt(_couponID, _calculateKpiLinkedInterestRate, _blockTimestamp());
    }

    function _calculateKpiLinkedInterestRate(
        uint256 _couponID,
        IBondRead.Coupon memory _coupon
    ) internal view override returns (uint256 rate_, uint8 rateDecimals) {
        KpiLinkedRateDataStorage memory kpiLinkedRateStorage = _kpiLinkedRateStorage();

        if (_coupon.fixingDate < kpiLinkedRateStorage.startPeriod) {
            return (kpiLinkedRateStorage.startRate, kpiLinkedRateStorage.rateDecimals);
        }

        address[] memory projects = _getProceedRecipients(0, _getProceedRecipientsCount());
        uint256 impactData = 0;
        bool reportFound = false;

        for (uint256 index = 0; index < projects.length; ) {
            (uint256 value, bool exists) = _getLatestKpiData(
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
        uint256 previousCouponId = _getPreviousCouponInOrderedList(_couponID);

        if (previousCouponId == 0) {
            return (0, 0);
        }

        IBondRead.Coupon memory previousCoupon = _getCoupon(previousCouponId).coupon;

        assert(previousCoupon.rateStatus == IBondRead.RateCalculationStatus.SET);

        return (previousCoupon.rate, previousCoupon.rateDecimals);
    }
}
