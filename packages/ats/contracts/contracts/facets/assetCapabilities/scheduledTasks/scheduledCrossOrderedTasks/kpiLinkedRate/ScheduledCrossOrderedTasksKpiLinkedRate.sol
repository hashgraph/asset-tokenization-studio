// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ScheduledCrossOrderedTasks } from "../ScheduledCrossOrderedTasks.sol";
import { IBondRead } from "../../../interfaces/bond/IBondRead.sol";
import { LibBond } from "../../../../../lib/domain/LibBond.sol";
import { LibInterestRate } from "../../../../../lib/domain/LibInterestRate.sol";
import { LibKpis } from "../../../../../lib/domain/LibKpis.sol";
import { LibProceedRecipients } from "../../../../../lib/domain/LibProceedRecipients.sol";

abstract contract ScheduledCrossOrderedTasksKpiLinkedRate is ScheduledCrossOrderedTasks {
    function _onCouponListed(uint256 _couponID, uint256 _timestamp) internal override {
        IBondRead.RegisteredCoupon memory registeredCoupon = LibBond.getCoupon(_couponID);
        IBondRead.Coupon memory coupon = registeredCoupon.coupon;

        if (coupon.rateStatus == IBondRead.RateCalculationStatus.SET) return;
        if (coupon.fixingDate > _timestamp) return;

        (uint256 startPeriod, uint256 startRate, uint8 cfgRateDecimals, uint256 reportPeriod) = LibInterestRate
            .getKpiLinkedRateConfig();

        if (coupon.fixingDate < startPeriod) {
            LibBond.updateCouponRate(_couponID, coupon, startRate, cfgRateDecimals);
            return;
        }

        // Aggregate KPI data from all proceed recipients
        uint256 impactData;
        bool reportFound;
        {
            address[] memory projects = LibProceedRecipients.getProceedRecipients(
                0,
                LibProceedRecipients.getProceedRecipientsCount()
            );

            for (uint256 i = 0; i < projects.length; ) {
                (uint256 value, bool exists) = LibKpis.getLatestKpiData(
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
            uint256 previousCouponId = LibBond.getPreviousCouponInOrderedList(_couponID, _timestamp);
            if (previousCouponId != 0) {
                IBondRead.Coupon memory prevCoupon = LibBond.getCoupon(previousCouponId).coupon;
                if (prevCoupon.rateStatus == IBondRead.RateCalculationStatus.SET) {
                    previousRate = prevCoupon.rate;
                    previousRateDecimals = prevCoupon.rateDecimals;
                }
            }
        }

        (uint256 rate, uint8 rateDecimals) = LibInterestRate.calculateKpiLinkedRate(
            impactData,
            previousRate,
            previousRateDecimals,
            reportFound
        );
        LibBond.updateCouponRate(_couponID, coupon, rate, rateDecimals);
    }
}
