// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    _SCHEDULED_CROSS_ORDERED_TASKS_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY
} from "../../../../../constants/resolverKeys/assets.sol";
import { ScheduledCrossOrderedTasks } from "../ScheduledCrossOrderedTasks.sol";
import {
    IScheduledCrossOrderedTasks
} from "../../../interfaces/scheduledTasks/scheduledCrossOrderedTasks/IScheduledCrossOrderedTasks.sol";
import { IStaticFunctionSelectors } from "../../../../../infrastructure/interfaces/IStaticFunctionSelectors.sol";
import { IBondRead } from "../../../interfaces/bond/IBondRead.sol";
import {
    ISustainabilityPerformanceTargetRate
} from "../../../interfaces/interestRates/sustainabilityPerformanceTargetRate/ISustainabilityPerformanceTargetRate.sol";
import { LibBond } from "../../../../../lib/domain/LibBond.sol";
import { LibInterestRate } from "../../../../../lib/domain/LibInterestRate.sol";
import { LibKpis } from "../../../../../lib/domain/LibKpis.sol";
import { LibProceedRecipients } from "../../../../../lib/domain/LibProceedRecipients.sol";
import { SustainabilityPerformanceTargetRateDataStorage } from "../../../../../storage/ScheduledStorage.sol";

contract ScheduledCrossOrderedTasksSustainabilityPerformanceTargetRateFacet is
    ScheduledCrossOrderedTasks,
    IStaticFunctionSelectors
{
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _SCHEDULED_CROSS_ORDERED_TASKS_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](4);
        staticFunctionSelectors_[selectorIndex++] = this.triggerPendingScheduledCrossOrderedTasks.selector;
        staticFunctionSelectors_[selectorIndex++] = this.triggerScheduledCrossOrderedTasks.selector;
        staticFunctionSelectors_[selectorIndex++] = this.scheduledCrossOrderedTaskCount.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getScheduledCrossOrderedTasks.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        staticInterfaceIds_[0] = type(IScheduledCrossOrderedTasks).interfaceId;
    }

    /// @notice Calculate and store the sustainability rate when a coupon is listed
    /// @dev Replicates the old _addToCouponsOrderedList override behavior from sustainability BondStorageWrapper
    function _onCouponListed(uint256 _couponID, uint256 _timestamp) internal override {
        IBondRead.RegisteredCoupon memory registeredCoupon = LibBond.getCoupon(_couponID);
        IBondRead.Coupon memory coupon = registeredCoupon.coupon;

        if (coupon.rateStatus == IBondRead.RateCalculationStatus.SET) return;
        if (coupon.fixingDate > _timestamp) return;

        SustainabilityPerformanceTargetRateDataStorage storage sptRateStorage = LibInterestRate.getSustainabilityRate();

        if (coupon.fixingDate < sptRateStorage.startPeriod) {
            LibBond.updateCouponRate(_couponID, coupon, sptRateStorage.startRate, sptRateStorage.rateDecimals);
            return;
        }

        (uint256 baseRate, uint8 decimals) = LibInterestRate.getBaseRate();

        // Get previous coupon's fixing date for period start
        uint256 periodStart = 0;
        uint256 previousCouponId = LibBond.getPreviousCouponInOrderedList(_couponID, _timestamp);
        if (previousCouponId != 0) {
            periodStart = LibBond.getCoupon(previousCouponId).coupon.fixingDate;
        }

        // Aggregate rate adjustments from all proceed recipients
        address[] memory projects = LibProceedRecipients.getProceedRecipients(
            0,
            LibProceedRecipients.getProceedRecipientsCount()
        );
        int256 totalRateAdjustment = 0;

        for (uint256 i = 0; i < projects.length; ) {
            address project = projects[i];
            ISustainabilityPerformanceTargetRate.ImpactData memory impactData = LibInterestRate
                .getSustainabilityImpactData(project);
            (uint256 value, bool exists) = LibKpis.getLatestKpiData(periodStart, coupon.fixingDate, project);
            int256 adjustment = LibInterestRate.calculateRateAdjustment(impactData, value, exists);
            totalRateAdjustment += adjustment;
            unchecked {
                ++i;
            }
        }

        int256 finalRate = int256(baseRate) + totalRateAdjustment;
        if (finalRate < 0) finalRate = 0;

        LibBond.updateCouponRate(_couponID, coupon, uint256(finalRate), decimals);
    }
}
