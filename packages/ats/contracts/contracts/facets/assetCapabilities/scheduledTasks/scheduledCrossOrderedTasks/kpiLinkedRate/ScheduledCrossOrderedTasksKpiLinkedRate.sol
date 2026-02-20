// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ScheduledCrossOrderedTasks } from "../ScheduledCrossOrderedTasks.sol";
import { IBondRead } from "../../../interfaces/bond/IBondRead.sol";
import { LibBond } from "../../../../../lib/domain/LibBond.sol";
import { LibInterestRate } from "../../../../../lib/domain/LibInterestRate.sol";
import { LibKpis } from "../../../../../lib/domain/LibKpis.sol";
import { LibProceedRecipients } from "../../../../../lib/domain/LibProceedRecipients.sol";
import { KpiLinkedRateDataStorage } from "../../../../../storage/ScheduledStorage.sol";

abstract contract ScheduledCrossOrderedTasksKpiLinkedRate is ScheduledCrossOrderedTasks {
    /// @notice Calculate and store the KPI-linked interest rate when a coupon is listed
    /// @dev Replicates the old _addToCouponsOrderedList override behavior from KPI-linked BondStorageWrapper
    function _onCouponListed(uint256 _couponID, uint256 _timestamp) internal override {
        IBondRead.RegisteredCoupon memory registeredCoupon = LibBond.getCoupon(_couponID);
        IBondRead.Coupon memory coupon = registeredCoupon.coupon;

        if (coupon.rateStatus == IBondRead.RateCalculationStatus.SET) return;
        if (coupon.fixingDate > _timestamp) return;

        KpiLinkedRateDataStorage storage kpiRateStorage = LibInterestRate.getKpiLinkedRate();

        if (coupon.fixingDate < kpiRateStorage.startPeriod) {
            LibBond.updateCouponRate(_couponID, coupon, kpiRateStorage.startRate, kpiRateStorage.rateDecimals);
            return;
        }

        // Aggregate KPI data from all proceed recipients
        address[] memory projects = LibProceedRecipients.getProceedRecipients(
            0,
            LibProceedRecipients.getProceedRecipientsCount()
        );
        uint256 impactData = 0;
        bool reportFound = false;

        for (uint256 i = 0; i < projects.length; ) {
            (uint256 value, bool exists) = LibKpis.getLatestKpiData(
                coupon.fixingDate - kpiRateStorage.reportPeriod,
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

        // Get previous coupon's stored rate (already SET because coupons are listed in order)
        uint256 previousRate = 0;
        uint8 previousRateDecimals = 0;
        uint256 previousCouponId = LibBond.getPreviousCouponInOrderedList(_couponID, _timestamp);
        if (previousCouponId != 0) {
            IBondRead.Coupon memory prevCoupon = LibBond.getCoupon(previousCouponId).coupon;
            if (prevCoupon.rateStatus == IBondRead.RateCalculationStatus.SET) {
                previousRate = prevCoupon.rate;
                previousRateDecimals = prevCoupon.rateDecimals;
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
