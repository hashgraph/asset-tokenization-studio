// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ICoupon } from "../../../../../../../../facets/layer_2/coupon/ICoupon.sol";
// prettier-ignore
/* solhint-disable max-line-length */
import { ISustainabilityPerformanceTargetRate } from "../../../../../../../../facets/layer_2/interestRate/sustainabilityPerformanceTargetRate/ISustainabilityPerformanceTargetRate.sol";
/* solhint-enable max-line-length */
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { ProceedRecipientsStorageWrapperKpiInterestRate } from "../../ProceedRecipientsStorageWrapper.sol";
import { InternalsSustainabilityPerformanceTargetInterestRate } from "../Internals.sol";
import { Internals } from "../../../../../../../../domain/Internals.sol";
import { CouponStorageWrapper } from "../../../../../../../../domain/asset/coupon/CouponStorageWrapper.sol";
import { KpisStorageWrapper } from "../../KpisStorageWrapper.sol";

abstract contract BondStorageWrapperSustainabilityPerformanceTargetInterestRate is
    InternalsSustainabilityPerformanceTargetInterestRate,
    ProceedRecipientsStorageWrapperKpiInterestRate
{
    using EnumerableSet for EnumerableSet.Bytes32Set;

    error InterestRateIsSustainabilityPerformanceTarget();

    function _setCoupon(
        ICoupon.Coupon memory _newCoupon
    )
        internal
        virtual
        override(Internals, CouponStorageWrapper)
        returns (bytes32 corporateActionId_, uint256 couponID_)
    {
        _checkCoupon(_newCoupon, InterestRateIsSustainabilityPerformanceTarget.selector, "");

        return super._setCoupon(_newCoupon);
    }

    function _addToCouponsOrderedList(uint256 _couponID) internal virtual override(Internals, KpisStorageWrapper) {
        super._addToCouponsOrderedList(_couponID);
        _setSustainabilityPerformanceTargetInterestRate(_couponID);
    }

    function _setSustainabilityPerformanceTargetInterestRate(uint256 _couponID) internal override {
        (ICoupon.RegisteredCoupon memory registeredCoupon, , ) = _getCoupon(_couponID);
        ICoupon.Coupon memory coupon = registeredCoupon.coupon;

        (uint256 rate, uint8 rateDecimals) = _calculateSustainabilityPerformanceTargetInterestRate(_couponID, coupon);

        _updateCouponRate(_couponID, coupon, rate, rateDecimals);
    }

    function _getCoupon(
        uint256 _couponID
    )
        internal
        view
        virtual
        override(Internals, CouponStorageWrapper)
        returns (ICoupon.RegisteredCoupon memory registeredCoupon_, bytes32 corporateActionId_, bool isDisabled_)
    {
        return
            _getCouponAdjustedAt(_couponID, _calculateSustainabilityPerformanceTargetInterestRate, _blockTimestamp());
    }

    function _calculateSustainabilityPerformanceTargetInterestRate(
        uint256 _couponID,
        ICoupon.Coupon memory _coupon
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

        for (uint256 index = 0; index < projects.length; index++) {
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

        (ICoupon.RegisteredCoupon memory registeredCoupon, , ) = _getCoupon(previousCouponId);
        ICoupon.Coupon memory previousCoupon = registeredCoupon.coupon;

        return previousCoupon.fixingDate;
    }
}
