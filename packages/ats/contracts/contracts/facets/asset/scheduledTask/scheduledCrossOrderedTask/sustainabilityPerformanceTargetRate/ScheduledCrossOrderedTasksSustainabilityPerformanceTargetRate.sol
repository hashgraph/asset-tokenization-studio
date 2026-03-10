// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ScheduledCrossOrderedTasks } from "../ScheduledCrossOrderedTasks.sol";
import { IBondRead } from "../../../bond/IBondRead.sol";
import {
    ISustainabilityPerformanceTargetRate
} from "../../../interestRate/sustainabilityPerformanceTargetRate/ISustainabilityPerformanceTargetRate.sol";
import { BondStorageWrapper } from "../../../../../domain/asset/BondStorageWrapper.sol";
import { InterestRateStorageWrapper } from "../../../../../domain/asset/InterestRateStorageWrapper.sol";
import { KpisStorageWrapper } from "../../../../../domain/asset/KpisStorageWrapper.sol";
import { ProceedRecipientsStorageWrapper } from "../../../../../domain/asset/ProceedRecipientsStorageWrapper.sol";

abstract contract ScheduledCrossOrderedTasksSustainabilityPerformanceTargetRate is ScheduledCrossOrderedTasks {
    function _onCouponListed(uint256 _couponID, uint256 _timestamp) internal override {
        IBondRead.RegisteredCoupon memory registeredCoupon = BondStorageWrapper.getCoupon(_couponID);
        IBondRead.Coupon memory coupon = registeredCoupon.coupon;

        if (coupon.rateStatus == IBondRead.RateCalculationStatus.SET) return;
        if (coupon.fixingDate > _timestamp) return;

        (uint256 startPeriod, uint256 startRate, uint8 cfgRateDecimals) = InterestRateStorageWrapper
            .getSustainabilityRateConfig();

        if (coupon.fixingDate < startPeriod) {
            BondStorageWrapper.updateCouponRate(_couponID, coupon, startRate, cfgRateDecimals);
            return;
        }

        (uint256 baseRate, uint8 decimals) = InterestRateStorageWrapper.getBaseRate();

        // Get previous coupon's fixing date for period start
        uint256 periodStart;
        {
            uint256 previousCouponId = BondStorageWrapper.getPreviousCouponInOrderedList(_couponID, _timestamp);
            if (previousCouponId != 0) {
                periodStart = BondStorageWrapper.getCoupon(previousCouponId).coupon.fixingDate;
            }
        }

        // Aggregate rate adjustments from all proceed recipients
        int256 totalRateAdjustment;
        {
            address[] memory projects = ProceedRecipientsStorageWrapper.getProceedRecipients(
                0,
                ProceedRecipientsStorageWrapper.getProceedRecipientsCount()
            );

            for (uint256 i = 0; i < projects.length; ) {
                address project = projects[i];
                ISustainabilityPerformanceTargetRate.ImpactData memory impactData = InterestRateStorageWrapper
                    .getSustainabilityImpactData(project);
                (uint256 value, bool exists) = KpisStorageWrapper.getLatestKpiData(
                    periodStart,
                    coupon.fixingDate,
                    project
                );
                totalRateAdjustment += InterestRateStorageWrapper.calculateRateAdjustment(impactData, value, exists);
                unchecked {
                    ++i;
                }
            }
        }

        int256 finalRate = int256(baseRate) + totalRateAdjustment;
        if (finalRate < 0) finalRate = 0;

        BondStorageWrapper.updateCouponRate(_couponID, coupon, uint256(finalRate), decimals);
    }
}
