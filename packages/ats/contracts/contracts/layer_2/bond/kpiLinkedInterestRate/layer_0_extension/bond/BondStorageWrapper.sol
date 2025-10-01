// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {Common} from '../../../../../layer_1/common/Common.sol';
import {IBondRead} from '../../../../interfaces/bond/IBondRead.sol';
import {
    COUPON_LISTING_TASK_TYPE,
    COUPON_CORPORATE_ACTION_TYPE
} from '../../../../../layer_0/constants/values.sol';
import {
    IKpi
} from '../../../../interfaces/interestRates/kpiLinkedRate/IKpi.sol';
import {
    IKpiLinkedRate
} from '../../../../interfaces/interestRates/kpiLinkedRate/IKpiLinkedRate.sol';
import {
    LowLevelCall
} from '../../../../../layer_0/common/libraries/LowLevelCall.sol';
import {
    EnumerableSet
} from '@openzeppelin/contracts/utils/structs/EnumerableSet.sol';

abstract contract BondStorageWrapperKpiLinkedInterestRate is Common {
    using LowLevelCall for address;
    using EnumerableSet for EnumerableSet.Bytes32Set;

    function _setCoupon(
        IBondRead.Coupon memory _newCoupon
    )
        internal
        virtual
        override
        returns (bytes32 corporateActionId_, uint256 couponID_)
    {
        _newCoupon.rate = 0;
        _newCoupon.rateDecimals = 0;
        return super._setCoupon(_newCoupon);
    }

    function _initCoupon(
        bytes32 _actionId,
        IBondRead.Coupon memory _newCoupon
    ) internal virtual override {
        super._initCoupon(_actionId, _newCoupon);

        _addScheduledCrossOrderedTask(
            _newCoupon.fixingDate,
            abi.encode(COUPON_LISTING_TASK_TYPE)
        );
        _addScheduledCouponListing(
            _newCoupon.fixingDate,
            abi.encode(_actionId)
        );
    }

    function _addToCouponsOrderedList(
        uint256 _couponID
    ) internal virtual override {
        _setKpiLinkedInterestRate(_couponID);
        super._addToCouponsOrderedList(_couponID);
    }

    function _setKpiLinkedInterestRate(uint256 _couponID) internal {
        KpiLinkedRateDataStorage
            memory kpiLinkedRateStorage = _kpiLinkedRateStorage();

        if (kpiLinkedRateStorage.kpiOracle == address(0)) {
            _updateCouponRate(
                _couponID,
                kpiLinkedRateStorage.baseRate,
                kpiLinkedRateStorage.rateDecimals
            );
            return;
        }

        uint256 timestamp = _blockTimestamp();

        if (timestamp < kpiLinkedRateStorage.startPeriod) {
            _updateCouponRate(
                _couponID,
                kpiLinkedRateStorage.startRate,
                kpiLinkedRateStorage.rateDecimals
            );
            return;
        }

        (uint256 impactData, bool reportFound) = abi.decode(
            kpiLinkedRateStorage.kpiOracle.functionStaticCall(
                abi.encodeWithSelector(
                    IKpi.getKpiData.selector,
                    timestamp - kpiLinkedRateStorage.reportPeriod,
                    timestamp
                ),
                IKpiLinkedRate.KpiOracleCalledFailed.selector
            ),
            (uint256, bool)
        );

        uint256 rate;

        if (!reportFound) {
            rate = _previousRate() + kpiLinkedRateStorage.missedPenalty;

            if (rate > kpiLinkedRateStorage.maxRate)
                rate = kpiLinkedRateStorage.maxRate;

            _updateCouponRate(
                _couponID,
                rate,
                kpiLinkedRateStorage.rateDecimals
            );
            return;
        }

        uint256 impactDeltaRate;

        if (kpiLinkedRateStorage.baseLine > impactData) {
            impactDeltaRate =
                (kpiLinkedRateStorage.baseLine - impactData) /
                (kpiLinkedRateStorage.baseLine -
                    kpiLinkedRateStorage.maxDeviationFloor);
            if (impactDeltaRate > 1) impactDeltaRate = 1;
            rate =
                kpiLinkedRateStorage.baseRate -
                ((kpiLinkedRateStorage.baseRate -
                    kpiLinkedRateStorage.minRate) * impactDeltaRate);
        } else {
            impactDeltaRate =
                (impactData - kpiLinkedRateStorage.baseLine) /
                (kpiLinkedRateStorage.maxDeviationCap -
                    kpiLinkedRateStorage.baseLine);
            if (impactDeltaRate > 1) impactDeltaRate = 1;
            rate =
                kpiLinkedRateStorage.baseRate +
                ((kpiLinkedRateStorage.maxRate -
                    kpiLinkedRateStorage.baseRate) * impactDeltaRate);
        }

        _updateCouponRate(_couponID, rate, kpiLinkedRateStorage.rateDecimals);
    }

    function _updateCouponRate(
        uint256 _couponID,
        uint256 _rate,
        uint8 _rateDecimals
    ) internal virtual {
        IBondRead.Coupon memory coupon = _getCoupon(_couponID).coupon;
        bytes32 actionId = _corporateActionsStorage()
            .actionsByType[COUPON_CORPORATE_ACTION_TYPE]
            .at(_couponID - 1);

        coupon.rate = _rate;
        coupon.rateDecimals = _rateDecimals;

        _updateCorporateActionData(actionId, abi.encode(coupon));
    }

    function _previousRate() internal view returns (uint256) {
        uint256 lastCouponPos = _getCouponsOrderedListTotal();
        if (lastCouponPos == 0) return 0;

        lastCouponPos--;

        uint256 lastCouponId = _getCouponFromOrderedListAt(lastCouponPos);

        IBondRead.Coupon memory coupon = _getCoupon(lastCouponId).coupon;

        return coupon.rate;
    }
}
