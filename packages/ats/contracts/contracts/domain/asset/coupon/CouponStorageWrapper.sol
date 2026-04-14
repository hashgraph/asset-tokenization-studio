// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    COUPON_CORPORATE_ACTION_TYPE,
    COUPON_LISTING_TASK_TYPE,
    SNAPSHOT_RESULT_ID,
    SNAPSHOT_TASK_TYPE
} from "../../../constants/values.sol";
import { BondStorageWrapper } from "../BondStorageWrapper.sol";
import { CorporateActionsStorageWrapper } from "../../core/CorporateActionsStorageWrapper.sol";
import { ERC1410StorageWrapper } from "../ERC1410StorageWrapper.sol";
import { ERC20StorageWrapper } from "../ERC20StorageWrapper.sol";
import { ERC3643StorageWrapper } from "../../core/ERC3643StorageWrapper.sol";
import { EvmAccessors } from "../../../infrastructure/utils/EvmAccessors.sol";
import { IBondTypes } from "../../../facets/layer_2/bond/IBondTypes.sol";
import { ICoupon } from "../../../facets/layer_2/coupon/ICoupon.sol";
import { ICouponTypes } from "../../../facets/layer_2/coupon/ICouponTypes.sol";
import { NominalValueStorageWrapper } from "../nominalValue/NominalValueStorageWrapper.sol";
import { Pagination } from "../../../infrastructure/utils/Pagination.sol";
import { ScheduledTasksStorageWrapper } from "../ScheduledTasksStorageWrapper.sol";
import { SnapshotsStorageWrapper } from "../SnapshotsStorageWrapper.sol";
import { TimeTravelStorageWrapper } from "../../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { _COUPON_STORAGE_POSITION } from "../../../constants/storagePositions.sol";

/// @title Coupon Storage Wrapper
/// @notice Library for managing Coupon storage operations.
/// @dev Provides structured access to CouponDataStorage at a dedicated storage slot.
library CouponStorageWrapper {
    struct CouponDataStorage {
        uint256[] couponsOrderedListByIds;
    }

    function setCoupon(
        ICouponTypes.Coupon memory newCoupon
    ) internal returns (bytes32 corporateActionId_, uint256 couponID_) {
        (corporateActionId_, couponID_) = CorporateActionsStorageWrapper.addCorporateAction(
            COUPON_CORPORATE_ACTION_TYPE,
            abi.encode(newCoupon)
        );

        initCoupon(corporateActionId_, newCoupon);

        emit ICoupon.CouponSet(corporateActionId_, couponID_, EvmAccessors.getMsgSender(), newCoupon);
    }

    function cancelCoupon(uint256 couponId) internal returns (bool success_) {
        ICouponTypes.RegisteredCoupon memory registeredCoupon;
        bytes32 corporateActionId;
        (registeredCoupon, corporateActionId, ) = getCoupon(couponId);
        if (registeredCoupon.coupon.executionDate <= TimeTravelStorageWrapper.getBlockTimestamp()) {
            revert ICoupon.CouponAlreadyExecuted(corporateActionId, couponId);
        }
        CorporateActionsStorageWrapper.cancelCorporateAction(corporateActionId);
        success_ = true;
        emit ICoupon.CouponCancelled(couponId, EvmAccessors.getMsgSender());
    }

    function initCoupon(bytes32 actionId, ICouponTypes.Coupon memory newCoupon) internal {
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
        _couponStorage().couponsOrderedListByIds.push(couponID);
    }

    function updateCouponRate(
        uint256 couponID,
        ICouponTypes.Coupon memory coupon,
        uint256 rate,
        uint8 rateDecimals
    ) internal {
        coupon.rate = rate;
        coupon.rateDecimals = rateDecimals;
        coupon.rateStatus = ICouponTypes.RateCalculationStatus.SET;

        CorporateActionsStorageWrapper.updateCorporateActionData(
            CorporateActionsStorageWrapper.getCorporateActionIdByTypeIndex(COUPON_CORPORATE_ACTION_TYPE, couponID - 1),
            abi.encode(coupon)
        );
    }

    function getCoupon(
        uint256 couponID
    )
        internal
        view
        returns (ICouponTypes.RegisteredCoupon memory registeredCoupon_, bytes32 corporateActionId_, bool isDisabled_)
    {
        corporateActionId_ = CorporateActionsStorageWrapper.getCorporateActionIdByTypeIndex(
            COUPON_CORPORATE_ACTION_TYPE,
            couponID - 1
        );
        bytes memory data;
        (, , data, isDisabled_) = CorporateActionsStorageWrapper.getCorporateAction(corporateActionId_);

        require(data.length > 0, "ICouponTypes: Coupon not found");
        (registeredCoupon_.coupon) = abi.decode(data, (ICouponTypes.Coupon));

        registeredCoupon_.snapshotId = CorporateActionsStorageWrapper.getUintResultAt(
            corporateActionId_,
            SNAPSHOT_RESULT_ID
        );
    }

    function getCouponFor(
        uint256 couponID,
        address account
    ) internal view returns (ICouponTypes.CouponFor memory couponFor_) {
        (ICouponTypes.RegisteredCoupon memory registeredCoupon, , bool isDisabled) = getCoupon(couponID);

        couponFor_.coupon = registeredCoupon.coupon;
        couponFor_.isDisabled = isDisabled;

        if (registeredCoupon.coupon.recordDate < TimeTravelStorageWrapper.getBlockTimestamp() && !isDisabled) {
            couponFor_.recordDateReached = true;
            couponFor_.tokenBalance = (registeredCoupon.snapshotId != 0)
                ? SnapshotsStorageWrapper.getTotalBalanceOfAtSnapshot(registeredCoupon.snapshotId, account)
                : ERC3643StorageWrapper.getTotalBalanceForAdjustedAt(
                    account,
                    TimeTravelStorageWrapper.getBlockTimestamp()
                );
            couponFor_.decimals = ERC20StorageWrapper.decimalsAdjustedAt(TimeTravelStorageWrapper.getBlockTimestamp());
            couponFor_.nominalValue = NominalValueStorageWrapper._getNominalValue();
        }

        couponFor_.couponAmount = _calculateCouponAmount(
            registeredCoupon.coupon,
            couponFor_.tokenBalance,
            couponFor_.decimals,
            couponFor_.recordDateReached
        );
    }

    function getCouponAmountFor(
        uint256 couponID,
        address account
    ) internal view returns (ICouponTypes.CouponAmountFor memory couponAmountFor_) {
        return getCouponFor(couponID, account).couponAmount;
    }

    function getCouponCount() internal view returns (uint256 couponCount_) {
        return CorporateActionsStorageWrapper.getCorporateActionCountByType(COUPON_CORPORATE_ACTION_TYPE);
    }

    function getCouponHolders(
        uint256 couponID,
        uint256 pageIndex,
        uint256 pageLength
    ) internal view returns (address[] memory holders_) {
        (ICouponTypes.RegisteredCoupon memory registeredCoupon, , ) = getCoupon(couponID);

        if (registeredCoupon.coupon.recordDate >= TimeTravelStorageWrapper.getBlockTimestamp()) return holders_;

        if (registeredCoupon.snapshotId != 0)
            return SnapshotsStorageWrapper.tokenHoldersAt(registeredCoupon.snapshotId, pageIndex, pageLength);

        return ERC1410StorageWrapper.getTokenHolders(pageIndex, pageLength);
    }

    function getTotalCouponHolders(uint256 couponID) internal view returns (uint256 total_) {
        (ICouponTypes.RegisteredCoupon memory registeredCoupon, , ) = getCoupon(couponID);

        if (registeredCoupon.coupon.recordDate >= TimeTravelStorageWrapper.getBlockTimestamp()) return 0;

        if (registeredCoupon.snapshotId != 0)
            return SnapshotsStorageWrapper.totalTokenHoldersAt(registeredCoupon.snapshotId);

        return ERC1410StorageWrapper.getTotalTokenHolders();
    }

    function getCouponFromOrderedListAt(uint256 pos) internal view returns (uint256 couponID_) {
        if (pos >= getCouponsOrderedListTotalAdjustedAt(TimeTravelStorageWrapper.getBlockTimestamp())) return 0;

        uint256 actualOrderedListLengthTotal = getCouponsOrderedListTotal();
        if (pos < actualOrderedListLengthTotal) {
            uint256 deprecatedTotal = BondStorageWrapper.DEPRECATED_getCouponsOrderedListTotal();
            if (pos < deprecatedTotal) {
                return BondStorageWrapper.DEPRECATED_getCouponsOrderedListByPosition(pos);
            }
            return _couponStorage().couponsOrderedListByIds[pos - deprecatedTotal];
        }

        uint256 pendingIndexOffset = pos - actualOrderedListLengthTotal;
        uint256 index = ScheduledTasksStorageWrapper.getScheduledCouponListingCount() - 1 - pendingIndexOffset;
        return ScheduledTasksStorageWrapper.getScheduledCouponListingIdAtIndex(index);
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
        total_ =
            _couponStorage().couponsOrderedListByIds.length +
            BondStorageWrapper.DEPRECATED_getCouponsOrderedListTotal();
    }

    function getPreviousCouponInOrderedList(uint256 couponID) internal view returns (uint256 previousCouponID_) {
        uint256 orderedListLength = getCouponsOrderedListTotal();

        if (orderedListLength < 2) return (0);

        if (getCouponFromOrderedListAt(0) == couponID) return (0);

        uint256 previousCouponId = 0;

        for (uint256 index = 0; index < orderedListLength; index++) {
            previousCouponId = getCouponFromOrderedListAt(index);
            if (index + 1 < orderedListLength) {
                uint256 couponId = getCouponFromOrderedListAt(index + 1);
                if (couponId == couponID) break;
            }
        }

        return previousCouponId;
    }

    function _calculateCouponAmount(
        ICouponTypes.Coupon memory coupon,
        uint256 tokenBalance,
        uint8 decimals,
        bool recordDateReached
    ) private view returns (ICouponTypes.CouponAmountFor memory couponAmountFor_) {
        if (!recordDateReached) return couponAmountFor_;

        uint256 period = coupon.endDate - coupon.startDate;
        uint256 nominalValue = NominalValueStorageWrapper._getNominalValue();
        uint8 nominalValueDecimals = NominalValueStorageWrapper._getNominalValueDecimals();

        couponAmountFor_.recordDateReached = true;
        couponAmountFor_.numerator = tokenBalance * nominalValue * coupon.rate * period;
        couponAmountFor_.denominator = 10 ** (decimals + nominalValueDecimals + coupon.rateDecimals) * 365 days;
    }

    // solhint-disable-next-line func-name-mixedcase
    function _couponStorage() private pure returns (CouponDataStorage storage cs_) {
        bytes32 position = _COUPON_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            cs_.slot := position
        }
    }
}
