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
import { ICoupon } from "../../../facets/coupon/ICoupon.sol";
import { ICouponTypes } from "../../../facets/coupon/ICouponTypes.sol";
import { IFixedRate } from "../../../facets/layer_2/interestRate/fixedRate/IFixedRate.sol";
import { InterestRateStorageWrapper } from "../InterestRateStorageWrapper.sol";
/* solhint-disable max-line-length */
import {
    ISustainabilityPerformanceTargetRateTypes
} from "../../../facets/layer_2/interestRate/sustainabilityPerformanceTargetRate/ISustainabilityPerformanceTargetRateTypes.sol";
/* solhint-enable max-line-length */
import { KpiLinkedRateLib } from "../KpiLinkedRateLib.sol";
import { NominalValueStorageWrapper } from "../nominalValue/NominalValueStorageWrapper.sol";
import { Pagination } from "../../../infrastructure/utils/Pagination.sol";
import { SustainabilityPerformanceTargetRateLib } from "../SustainabilityPerformanceTargetRateLib.sol";
import { ScheduledTasksStorageWrapper } from "../ScheduledTasksStorageWrapper.sol";
import { SnapshotsStorageWrapper } from "../SnapshotsStorageWrapper.sol";
import { TimeTravelStorageWrapper } from "../../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { _COUPON_STORAGE_POSITION } from "../../../constants/storagePositions.sol";

/// @title Coupon Storage Wrapper
/// @notice Library for managing Coupon storage operations.
/// @dev Provides structured access to CouponDataStorage at a dedicated storage slot.
/// @author Asset Tokenization Studio Team
library CouponStorageWrapper {
    struct CouponDataStorage {
        uint256[] couponsOrderedListByIds;
    }

    /**
     * @notice Persists a new coupon corporate action and schedules its snapshot/listing
     *         tasks. Variant invariants and rate stamping are delegated to
     *         `_validateAndResolveRate`, which mirrors the deferred dispatch performed by
     *         `getCoupon` on the read path.
     * @dev Does NOT emit `ICoupon.CouponSet` — the writer abstract emits it inline after
     *      this call returns, per the project event-emission rule.
     * @param newCoupon Coupon parameters captured at scheduling time.
     * @return corporateActionId_ Identifier of the underlying corporate action.
     * @return couponID_ One-indexed identifier assigned to the new coupon.
     * @return resolved_ The persisted coupon after variant-specific rate stamping (input
     *         struct unchanged for the standard / KPI / SPT variants; `rate`,
     *         `rateDecimals`, `rateStatus` overwritten for the fixed-rate variant).
     */
    function setCoupon(
        ICouponTypes.Coupon memory newCoupon
    ) internal returns (bytes32 corporateActionId_, uint256 couponID_, ICouponTypes.Coupon memory resolved_) {
        newCoupon = _validateAndResolveRate(newCoupon);

        (corporateActionId_, couponID_) = CorporateActionsStorageWrapper.addCorporateAction(
            COUPON_CORPORATE_ACTION_TYPE,
            abi.encode(newCoupon)
        );

        initCoupon(corporateActionId_, newCoupon);
        resolved_ = newCoupon;
    }

    /**
     * @notice Cancels a previously scheduled coupon before its execution date is reached.
     * @dev Reverts with `ICoupon.CouponAlreadyExecuted` if the execution date has passed.
     *      Does NOT emit `ICoupon.CouponCancelled` — the writer abstract emits it inline
     *      after this call returns, per the project event-emission rule.
     * @param couponId One-indexed identifier of the coupon to cancel.
     * @return success_ True once the cancellation has been recorded.
     */
    function cancelCoupon(uint256 couponId) internal returns (bool success_) {
        ICouponTypes.RegisteredCoupon memory registeredCoupon;
        bytes32 corporateActionId;
        (registeredCoupon, corporateActionId, ) = getCoupon(couponId);
        if (
            registeredCoupon.coupon.executionDate != 0 &&
            registeredCoupon.coupon.executionDate <= TimeTravelStorageWrapper.getBlockTimestamp()
        ) {
            revert ICoupon.CouponAlreadyExecuted(corporateActionId, couponId);
        }
        CorporateActionsStorageWrapper.cancelCorporateAction(corporateActionId);
        success_ = true;
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

        if (data.length == 0) revert ICoupon.CouponNotFound(couponID);
        (registeredCoupon_.coupon) = abi.decode(data, (ICouponTypes.Coupon));

        registeredCoupon_.snapshotId = CorporateActionsStorageWrapper.getUintResultAt(
            corporateActionId_,
            SNAPSHOT_RESULT_ID
        );

        if (
            registeredCoupon_.coupon.fixingDate == 0 ||
            registeredCoupon_.coupon.rateStatus == ICouponTypes.RateCalculationStatus.SET ||
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
            registeredCoupon_.coupon.rateStatus = ICouponTypes.RateCalculationStatus.SET;
            return (registeredCoupon_, corporateActionId_, isDisabled_);
        }

        if (InterestRateStorageWrapper.isKpiLinkedRateInitialized()) {
            (registeredCoupon_.coupon.rate, registeredCoupon_.coupon.rateDecimals) = KpiLinkedRateLib
                .calculateKpiLinkedInterestRate(couponID, registeredCoupon_.coupon);
            registeredCoupon_.coupon.rateStatus = ICouponTypes.RateCalculationStatus.SET;
        }
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
            if (registeredCoupon.snapshotId != 0) {
                couponFor_.tokenBalance = SnapshotsStorageWrapper.getTotalBalanceOfAtSnapshot(
                    registeredCoupon.snapshotId,
                    account
                );
                couponFor_.decimals = SnapshotsStorageWrapper.decimalsAtSnapshot(registeredCoupon.snapshotId);
                couponFor_.nominalValue = SnapshotsStorageWrapper.nominalValueAtSnapshot(registeredCoupon.snapshotId);
                couponFor_.nominalValueDecimals = SnapshotsStorageWrapper.nominalValueDecimalsAtSnapshot(
                    registeredCoupon.snapshotId
                );
            } else {
                couponFor_.tokenBalance = ERC3643StorageWrapper.getTotalBalanceForAdjustedAt(
                    account,
                    registeredCoupon.coupon.recordDate
                );
                couponFor_.decimals = ERC20StorageWrapper.decimalsAdjustedAt(registeredCoupon.coupon.recordDate);
                couponFor_.nominalValue = NominalValueStorageWrapper.getNominalValue();
                couponFor_.nominalValueDecimals = NominalValueStorageWrapper.getNominalValueDecimals();
            }
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
        uint256 orderedListLength = getCouponsOrderedListTotalAdjustedAt(TimeTravelStorageWrapper.getBlockTimestamp());

        if (orderedListLength < 2) return (0);

        if (getCouponFromOrderedListAt(0) == couponID) return (0);

        orderedListLength--;
        uint256 previousCouponId = 0;

        for (uint256 index = 0; index < orderedListLength; index++) {
            previousCouponId = getCouponFromOrderedListAt(index);
            uint256 couponId = getCouponFromOrderedListAt(index + 1);
            if (couponId == couponID) break;
        }

        return previousCouponId;
    }

    /**
     * @notice Validates the coupon's rate triplet against the bond's rate variant and,
     *         for fixed-rate bonds, stamps the configured rate before persistence.
     * @dev Variant dispatch (write-path mirror of `getCoupon`'s read-path dispatch via
     *      `InterestRateStorageWrapper.is<Variant>Initialized()`):
     *      - **Fixed-rate** bonds: reject any user-supplied rate, then stamp the configured
     *        rate from `InterestRateStorageWrapper.getRate()` and `rateStatus = SET`.
     *      - **KPI-linked-rate** bonds: reject any user-supplied rate; the rate stays
     *        `PENDING` and is resolved at read time.
     *      - **SPT-rate** bonds: same shape as KPI-linked.
     *      - **Standard** bonds (no rate variant initialised): pass the user-supplied rate
     *        through unchanged.
     * @param newCoupon User-supplied coupon parameters.
     * @return resolved_ The same coupon, potentially with `rate`, `rateDecimals` and
     *         `rateStatus` overwritten for the fixed-rate variant.
     */
    function _validateAndResolveRate(
        ICouponTypes.Coupon memory newCoupon
    ) private view returns (ICouponTypes.Coupon memory resolved_) {
        if (InterestRateStorageWrapper.isFixedRateInitialized()) {
            if (!_isPendingRate(newCoupon)) revert IFixedRate.InterestRateIsFixed();
            (newCoupon.rate, newCoupon.rateDecimals) = InterestRateStorageWrapper.getRate();
            newCoupon.rateStatus = ICouponTypes.RateCalculationStatus.SET;
        } else if (InterestRateStorageWrapper.isKpiLinkedRateInitialized()) {
            if (!_isPendingRate(newCoupon)) revert ICoupon.InterestRateIsKpiLinked();
        } else if (InterestRateStorageWrapper.isSustainabilityPerformanceTargetRateInitialized()) {
            if (!_isPendingRate(newCoupon)) {
                revert ISustainabilityPerformanceTargetRateTypes.InterestRateIsSustainabilityPerformanceTargetRate();
            }
        }
        resolved_ = newCoupon;
    }

    function _calculateCouponAmount(
        ICouponTypes.Coupon memory coupon,
        uint256 tokenBalance,
        uint8 decimals,
        bool recordDateReached
    ) private view returns (ICouponTypes.CouponAmountFor memory couponAmountFor_) {
        if (!recordDateReached) return couponAmountFor_;

        uint256 period = coupon.endDate - coupon.startDate;
        uint256 nominalValue = NominalValueStorageWrapper.getNominalValue();
        uint8 nominalValueDecimals = NominalValueStorageWrapper.getNominalValueDecimals();

        couponAmountFor_.recordDateReached = true;
        couponAmountFor_.numerator = tokenBalance * nominalValue * coupon.rate * period;
        couponAmountFor_.denominator = 10 ** (decimals + nominalValueDecimals + coupon.rateDecimals) * 365 days;
    }

    /**
     * @notice Tells whether a user-supplied coupon has its rate triplet in the
     *         pending shape (`rateStatus = PENDING`, `rate = 0`, `rateDecimals = 0`).
     * @dev Variant invariants reject any non-pending rate triplet so the user cannot
     *      pre-stamp a rate for variants where the rate is owned by the protocol.
     * @param newCoupon Coupon parameters captured at scheduling time.
     * @return ok_ True iff the rate triplet is pending.
     */
    function _isPendingRate(ICouponTypes.Coupon memory newCoupon) private pure returns (bool ok_) {
        ok_ =
            newCoupon.rateStatus == ICouponTypes.RateCalculationStatus.PENDING &&
            newCoupon.rate == 0 &&
            newCoupon.rateDecimals == 0;
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
