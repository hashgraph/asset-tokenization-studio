// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBondRead } from "contracts/layer_2/interfaces/bond/IBondRead.sol";
// prettier-ignore
// solhint-disable-next-line max-line-length
import { ISustainabilityPerformanceTargetRate } from "contracts/layer_2/interfaces/interestRates/sustainabilityPerformanceTargetRate/ISustainabilityPerformanceTargetRate.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import {
    ProceedRecipientsStorageWrapperSustainabilityPerformanceTargetInterestRate
} from "../proceedRecipients/ProceedRecipientsStorageWrapper.sol";
import { Internals } from "contracts/layer_0/Internals.sol";
import { BondStorageWrapper } from "contracts/layer_0/bond/BondStorageWrapper.sol";

abstract contract BondStorageWrapperSustainabilityPerformanceTargetInterestRate is
    ProceedRecipientsStorageWrapperSustainabilityPerformanceTargetInterestRate
{
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
        uint256 _couponID,
        IBondRead.Coupon memory _coupon
    ) internal view override returns (uint256 rate_, uint8 rateDecimals_) {
        SustainabilityPerformanceTargetRateDataStorage
            storage sustainabilityPerformanceTargetRateStorage = _sustainabilityPerformanceTargetRateStorage();

        if (_coupon.fixingDate < sustainabilityPerformanceTargetRateStorage.startPeriod) {
            return (
                sustainabilityPerformanceTargetRateStorage.startRate,
                sustainabilityPerformanceTargetRateStorage.rateDecimals
            );
        }

        rate_ = sustainabilityPerformanceTargetRateStorage.baseRate;
        rateDecimals_ = sustainabilityPerformanceTargetRateStorage.rateDecimals;

        address[] memory projects = _getProceedRecipients(0, _getProceedRecipientsCount());
        uint256 totalRateToAdd = 0;
        uint256 totalRateToSubtract = 0;

        for (uint256 index = 0; index < projects.length; ) {
            ISustainabilityPerformanceTargetRate.ImpactData memory impactData = _getSPTImpactDataFor(projects[index]);

            (uint256 value, bool exists) = _getLatestKpiData(
                _previousFixingDate(_couponID),
                _coupon.fixingDate,
                projects[index]
            );

            if (impactData.impactDataMode == ISustainabilityPerformanceTargetRate.ImpactDataMode.PENALTY) {
                if (!exists) {
                    totalRateToAdd += impactData.deltaRate;
                    continue;
                }
                if (impactData.baseLineMode == ISustainabilityPerformanceTargetRate.BaseLineMode.MINIMUM) {
                    if (value < impactData.baseLine) {
                        totalRateToAdd += impactData.deltaRate;
                        continue;
                    }
                } else {
                    if (value > impactData.baseLine) {
                        totalRateToAdd += impactData.deltaRate;
                        continue;
                    }
                }
            } else {
                if (!exists) {
                    continue;
                }
                if (impactData.baseLineMode == ISustainabilityPerformanceTargetRate.BaseLineMode.MINIMUM) {
                    if (value > impactData.baseLine) {
                        totalRateToSubtract += impactData.deltaRate;
                        continue;
                    }
                } else {
                    if (value < impactData.baseLine) {
                        totalRateToSubtract += impactData.deltaRate;
                        continue;
                    }
                }
            }

            unchecked {
                ++index;
            }
        }

        rate_ += totalRateToAdd;

        if (rate_ > totalRateToSubtract) {
            rate_ -= totalRateToSubtract;
        } else {
            rate_ = 0;
        }
    }

    function _previousFixingDate(uint256 _couponID) internal view returns (uint256 fixingDate_) {
        uint256 previousCouponId = _getPreviousCouponInOrderedList(_couponID);

        if (previousCouponId == 0) {
            return 0;
        }

        IBondRead.Coupon memory previousCoupon = _getCoupon(previousCouponId).coupon;

        return previousCoupon.fixingDate;
    }
}
