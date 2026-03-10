// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ScheduledCrossOrderedTasks } from "../ScheduledCrossOrderedTasks.sol";
import { IBondRead } from "../../../bond/IBondRead.sol";
import { BondStorageWrapper } from "../../../../../domain/asset/BondStorageWrapper.sol";
import { InterestRateStorageWrapper } from "../../../../../domain/asset/InterestRateStorageWrapper.sol";
import { KpisStorageWrapper } from "../../../../../domain/asset/KpisStorageWrapper.sol";
import { ProceedRecipientsStorageWrapper } from "../../../../../domain/asset/ProceedRecipientsStorageWrapper.sol";

abstract contract ScheduledCrossOrderedTasksKpiLinkedRate is ScheduledCrossOrderedTasks {
    function _onCouponListed(uint256 _couponID, uint256 _timestamp) internal override {
        IBondRead.RegisteredCoupon memory registeredCoupon = BondStorageWrapper.getCoupon(_couponID);
        IBondRead.Coupon memory coupon = registeredCoupon.coupon;

        if (coupon.rateStatus == IBondRead.RateCalculationStatus.SET) return;
        if (coupon.fixingDate > _timestamp) return;

        (
            uint256 startPeriod,
            uint256 startRate,
            uint8 cfgRateDecimals,
            uint256 reportPeriod
        ) = InterestRateStorageWrapper.getKpiLinkedRateConfig();

        if (coupon.fixingDate < startPeriod) {
            BondStorageWrapper.updateCouponRate(_couponID, coupon, startRate, cfgRateDecimals);
            return;
        }

        // Aggregate KPI data from all proceed recipients
        uint256 impactData;
        bool reportFound;
        {
            address[] memory projects = ProceedRecipientsStorageWrapper.getProceedRecipients(
                0,
                ProceedRecipientsStorageWrapper.getProceedRecipientsCount()
            );

            for (uint256 i = 0; i < projects.length; ) {
                (uint256 value, bool exists) = KpisStorageWrapper.getLatestKpiData(
                    coupon.fixingDate - reportPeriod,
                    coupon.fixingDate,
                    projects[i]
                );
                if (exists) {
                    impactData += value;
                    if (!reportFound) reportFound = true;
                }
                unchecked {
                    ++i;
                }
            }
        }

        // Get previous coupon's stored rate
        uint256 previousRate;
        uint8 previousRateDecimals;
        {
            uint256 previousCouponId = BondStorageWrapper.getPreviousCouponInOrderedList(_couponID, _timestamp);
            if (previousCouponId != 0) {
                IBondRead.Coupon memory prevCoupon = BondStorageWrapper.getCoupon(previousCouponId).coupon;
                if (prevCoupon.rateStatus == IBondRead.RateCalculationStatus.SET) {
                    previousRate = prevCoupon.rate;
                    previousRateDecimals = prevCoupon.rateDecimals;
                }
            }
        }

        (uint256 rate, uint8 rateDecimals) = InterestRateStorageWrapper.calculateKpiLinkedRate(
            impactData,
            previousRate,
            previousRateDecimals,
            reportFound
        );
        BondStorageWrapper.updateCouponRate(_couponID, coupon, rate, rateDecimals);
    }
}
