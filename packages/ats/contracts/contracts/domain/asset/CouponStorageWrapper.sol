// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    COUPON_CORPORATE_ACTION_TYPE,
    COUPON_LISTING_TASK_TYPE,
    SNAPSHOT_RESULT_ID,
    SNAPSHOT_TASK_TYPE
} from "../../constants/values.sol";
import { _COUPON_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { BondStorageWrapper } from "./BondStorageWrapper.sol";
import { CorporateActionsStorageWrapper } from "../core/CorporateActionsStorageWrapper.sol";
import { ERC1410StorageWrapper } from "./ERC1410StorageWrapper.sol";
import { ERC20StorageWrapper } from "./ERC20StorageWrapper.sol";
import { ERC3643StorageWrapper } from "../core/ERC3643StorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { IBondTypes } from "../../facets/layer_2/bond/IBondTypes.sol";
import { ICoupon } from "../../facets/layer_2/coupon/ICoupon.sol";
import { InterestRateStorageWrapper } from "./InterestRateStorageWrapper.sol";
import { KpiLinkedRateLib } from "./KpiLinkedRateLib.sol";
import { Pagination } from "../../infrastructure/utils/Pagination.sol";
import { ScheduledTasksStorageWrapper } from "./ScheduledTasksStorageWrapper.sol";
import { SnapshotsStorageWrapper } from "./SnapshotsStorageWrapper.sol";
import { SustainabilityPerformanceTargetRateLib } from "./SustainabilityPerformanceTargetRateLib.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";

library CouponStorageWrapper {
    struct CouponDataStorage {
        uint256[] couponsOrderedListByIds;
    }

    function setCoupon(
        ICoupon.Coupon memory newCoupon
    ) internal returns (bytes32 corporateActionId_, uint256 couponID_) {
        (corporateActionId_, couponID_) = CorporateActionsStorageWrapper.addCorporateAction(
            COUPON_CORPORATE_ACTION_TYPE,
            abi.encode(newCoupon)
        );

        initCoupon(corporateActionId_, newCoupon);

        emit ICoupon.CouponSet(corporateActionId_, couponID_, EvmAccessors.getMsgSender(), newCoupon);
    }

    function initCoupon(bytes32 actionId, ICoupon.Coupon memory newCoupon) internal {
        if (actionId == bytes32(0)) {
            revert ICoupon.CouponCreationFailed();
        }

        ScheduledTasksStorageWrapper.addScheduledCrossOrderedTask(newCoupon.recordDate, SNAPSHOT_TASK_TYPE);
        ScheduledTasksStorageWrapper.addScheduledSnapshot(newCoupon.recordDate, actionId);

        if (newCoupon.fixingDate == 0) return;
        ScheduledTasksStorageWrapper.addScheduledCrossOrderedTask(newCoupon.fixingDate, COUPON_LISTING_TASK_TYPE);
        ScheduledTasksStorageWrapper.addScheduledCouponListing(newCoupon.fixingDate, actionId);
    }

    function addToCouponsOrderedList(uint256 couponID) internal {
        couponStorage().couponsOrderedListByIds.push(couponID);
    }

    function updateCouponRate(
        uint256 couponID,
        ICoupon.Coupon memory coupon,
        uint256 rate,
        uint8 rateDecimals
    ) internal {
        coupon.rate = rate;
        coupon.rateDecimals = rateDecimals;
        coupon.rateStatus = ICoupon.RateCalculationStatus.SET;

        CorporateActionsStorageWrapper.updateCorporateActionData(
            CorporateActionsStorageWrapper.getCorporateActionIdByTypeIndex(COUPON_CORPORATE_ACTION_TYPE, couponID - 1),
            abi.encode(coupon)
        );
    }

    function cancelCoupon(uint256 couponId) internal returns (bool success_) {
        ICoupon.RegisteredCoupon memory registeredCoupon;
        bytes32 corporateActionId;
        (registeredCoupon, corporateActionId, ) = getCoupon(couponId);
        if (registeredCoupon.coupon.executionDate <= TimeTravelStorageWrapper.getBlockTimestamp()) {
            revert ICoupon.CouponAlreadyExecuted(corporateActionId, couponId);
        }
        CorporateActionsStorageWrapper.cancelCorporateAction(corporateActionId);
        success_ = true;
    }

    function getCoupon(
        uint256 couponID
    )
        internal
        view
        returns (ICoupon.RegisteredCoupon memory registeredCoupon_, bytes32 corporateActionId_, bool isDisabled_)
    {
        corporateActionId_ = CorporateActionsStorageWrapper.getCorporateActionIdByTypeIndex(
            COUPON_CORPORATE_ACTION_TYPE,
            couponID - 1
        );

        bytes memory data;
        (, , data, isDisabled_) = CorporateActionsStorageWrapper.getCorporateAction(corporateActionId_);

        if (data.length > 0) {
            registeredCoupon_.coupon = abi.decode(data, (ICoupon.Coupon));
        }

        registeredCoupon_.snapshotId = CorporateActionsStorageWrapper.getUintResultAt(
            corporateActionId_,
            SNAPSHOT_RESULT_ID
        );

        if (
            InterestRateStorageWrapper.isFixedRateInitialized() ||
            registeredCoupon_.coupon.fixingDate == 0 ||
            registeredCoupon_.coupon.rateStatus == ICoupon.RateCalculationStatus.SET ||
            registeredCoupon_.coupon.fixingDate > TimeTravelStorageWrapper.getBlockTimestamp()
        ) return (registeredCoupon_, corporateActionId_, isDisabled_);

        if (InterestRateStorageWrapper.isSustainabilityPerformanceTargetRateInitialized()) {
            (
                registeredCoupon_.coupon.rate,
                registeredCoupon_.coupon.rateDecimals
            ) = SustainabilityPerformanceTargetRateLib.calculateSustainabilityPerformanceTargetInterestRate(
                couponID,
                registeredCoupon_.coupon
            );
            registeredCoupon_.coupon.rateStatus = ICoupon.RateCalculationStatus.SET;
            return (registeredCoupon_, corporateActionId_, isDisabled_);
        }

        (registeredCoupon_.coupon.rate, registeredCoupon_.coupon.rateDecimals) = KpiLinkedRateLib
            .calculateKpiLinkedInterestRate(couponID, registeredCoupon_.coupon);
        registeredCoupon_.coupon.rateStatus = ICoupon.RateCalculationStatus.SET;
    }

    function getCouponFor(
        uint256 couponID,
        address account
    ) internal view returns (ICoupon.CouponFor memory couponFor_) {
        (ICoupon.RegisteredCoupon memory registeredCoupon, , bool isDisabled) = getCoupon(couponID);

        couponFor_.isDisabled = isDisabled;

        couponFor_.coupon = registeredCoupon.coupon;

        if (registeredCoupon.coupon.recordDate >= TimeTravelStorageWrapper.getBlockTimestamp()) return couponFor_;

        couponFor_.recordDateReached = true;

        couponFor_.tokenBalance = (registeredCoupon.snapshotId != 0)
            ? SnapshotsStorageWrapper.getTotalBalanceOfAtSnapshot(registeredCoupon.snapshotId, account)
            : ERC3643StorageWrapper.getTotalBalanceForAdjustedAt(account, TimeTravelStorageWrapper.getBlockTimestamp());

        couponFor_.decimals = ERC20StorageWrapper.decimalsAdjustedAt(TimeTravelStorageWrapper.getBlockTimestamp());
    }

    function getCouponsFor(
        uint256 couponID,
        uint256 pageIndex,
        uint256 pageLength
    ) internal view returns (ICoupon.CouponFor[] memory couponsFor_, address[] memory accounts_) {
        address[] memory couponHolders = getCouponHolders(couponID, pageIndex, pageLength);
        uint256 length = couponHolders.length;
        couponsFor_ = new ICoupon.CouponFor[](length);
        accounts_ = new address[](length);
        for (uint256 i; i < length; ) {
            couponsFor_[i] = getCouponFor(couponID, couponHolders[i]);
            accounts_[i] = couponHolders[i];
            unchecked {
                ++i;
            }
        }
    }

    function getCouponAmountFor(
        uint256 couponID,
        address account
    ) internal view returns (ICoupon.CouponAmountFor memory couponAmountFor_) {
        ICoupon.CouponFor memory couponFor = getCouponFor(couponID, account);

        if (!couponFor.recordDateReached) return couponAmountFor_;

        IBondTypes.BondDetailsData memory bondDetails = BondStorageWrapper.getBondDetails();

        couponAmountFor_.recordDateReached = true;

        couponAmountFor_.numerator =
            couponFor.tokenBalance *
            bondDetails.nominalValue *
            couponFor.coupon.rate *
            (couponFor.coupon.endDate - couponFor.coupon.startDate);
        couponAmountFor_.denominator =
            10 ** (couponFor.decimals + bondDetails.nominalValueDecimals + couponFor.coupon.rateDecimals) *
            365 days;
    }

    function getCouponCount() internal view returns (uint256 couponCount_) {
        return CorporateActionsStorageWrapper.getCorporateActionCountByType(COUPON_CORPORATE_ACTION_TYPE);
    }

    function getCouponHolders(
        uint256 couponID,
        uint256 pageIndex,
        uint256 pageLength
    ) internal view returns (address[] memory holders_) {
        (ICoupon.RegisteredCoupon memory registeredCoupon, , ) = getCoupon(couponID);

        if (registeredCoupon.coupon.recordDate >= TimeTravelStorageWrapper.getBlockTimestamp()) return holders_;

        if (registeredCoupon.snapshotId != 0)
            return SnapshotsStorageWrapper.tokenHoldersAt(registeredCoupon.snapshotId, pageIndex, pageLength);

        return ERC1410StorageWrapper.getTokenHolders(pageIndex, pageLength);
    }

    function getTotalCouponHolders(uint256 couponID) internal view returns (uint256) {
        (ICoupon.RegisteredCoupon memory registeredCoupon, , ) = getCoupon(couponID);

        if (registeredCoupon.coupon.recordDate >= TimeTravelStorageWrapper.getBlockTimestamp()) return 0;

        if (registeredCoupon.snapshotId != 0)
            return SnapshotsStorageWrapper.totalTokenHoldersAt(registeredCoupon.snapshotId);

        return ERC1410StorageWrapper.getTotalTokenHolders();
    }

    function getCouponFromOrderedListAt(uint256 pos) internal view returns (uint256 couponID_) {
        if (pos >= getCouponsOrderedListTotalAdjustedAt(TimeTravelStorageWrapper.getBlockTimestamp())) return 0;

        uint256 actualOrderedListLengthTotal = getCouponsOrderedListTotal();

        if (pos < actualOrderedListLengthTotal) return couponStorage().couponsOrderedListByIds[pos];

        return
            ScheduledTasksStorageWrapper.getScheduledCouponListingIdAtIndex(
                ScheduledTasksStorageWrapper.getScheduledCouponListingCount() + actualOrderedListLengthTotal - 1 - pos
            );
    }

    function getCouponsOrderedList(
        uint256 pageIndex,
        uint256 pageLength
    ) internal view returns (uint256[] memory couponIDs_) {
        (uint256 start, uint256 end) = Pagination.getStartAndEnd(pageIndex, pageLength);

        couponIDs_ = new uint256[](
            Pagination.getSize(
                start,
                end,
                getCouponsOrderedListTotalAdjustedAt(TimeTravelStorageWrapper.getBlockTimestamp())
            )
        );

        uint256 length = couponIDs_.length;
        for (uint256 i; i < length; ) {
            unchecked {
                couponIDs_[i] = getCouponFromOrderedListAt(start + i);
                ++i;
            }
        }
    }

    function getCouponsOrderedListTotalAdjustedAt(uint256 timestamp) internal view returns (uint256 total_) {
        return
            getCouponsOrderedListTotal() +
            ScheduledTasksStorageWrapper.getPendingScheduledCouponListingTotalAt(timestamp);
    }

    function getCouponsOrderedListTotal() internal view returns (uint256 total_) {
        return couponStorage().couponsOrderedListByIds.length;
    }

    function getPreviousCouponInOrderedList(uint256 couponID) internal view returns (uint256 previousCouponID_) {
        uint256 orderedListLength = getCouponsOrderedListTotalAdjustedAt(TimeTravelStorageWrapper.getBlockTimestamp());

        if (orderedListLength < 2 || getCouponFromOrderedListAt(0) == couponID) return 0;

        unchecked {
            --orderedListLength;
            for (uint256 index; index < orderedListLength; ) {
                previousCouponID_ = getCouponFromOrderedListAt(index);
                if (getCouponFromOrderedListAt(++index) == couponID) return previousCouponID_;
            }
        }
    }

    function couponStorage() internal pure returns (CouponDataStorage storage couponData_) {
        bytes32 position = _COUPON_STORAGE_POSITION;
        assembly {
            couponData_.slot := position
        }
    }
}
