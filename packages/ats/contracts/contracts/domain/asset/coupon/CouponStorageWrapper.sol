// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    COUPON_CORPORATE_ACTION_TYPE,
    COUPON_LISTING_TASK_TYPE,
    SNAPSHOT_RESULT_ID,
    SNAPSHOT_TASK_TYPE
} from "../../../constants/values.sol";
import { CorporateActionsStorageWrapper } from "../../core/CorporateActionsStorageWrapper.sol";
import { ERC1410StorageWrapper } from "../ERC1410StorageWrapper.sol";
import { ERC20StorageWrapper } from "../ERC20StorageWrapper.sol";
import { ERC3643StorageWrapper } from "../../core/ERC3643StorageWrapper.sol";
import { ICoupon } from "../../../facets/coupon/ICoupon.sol";
import { ICouponTypes } from "../../../facets/coupon/ICouponTypes.sol";
import { BondStorageWrapper } from "../BondStorageWrapper.sol";
import { CouponRateDispatch } from "./CouponRateDispatch.sol";
import { DatesValidation } from "../../../infrastructure/utils/DatesValidation.sol";
import { NominalValueStorageWrapper } from "../nominalValue/NominalValueStorageWrapper.sol";
import { Pagination } from "../../../infrastructure/utils/Pagination.sol";
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
     *         `CouponRateDispatch.validateAndStamp`, which mirrors the deferred dispatch
     *         performed by `getCoupon` on the read path.
     * @dev Reverts with `ICommonErrors.WrongDates` when the bond carries a non-zero maturity
     *      date and `newCoupon.endDate` exceeds it. When `maturityDate` is zero the bond is
     *      treated as open-ended and no constraint is applied.
     *      Does NOT emit `ICoupon.CouponSet` — the writer abstract emits it inline after
     *      this call returns, per the project event-emission rule.
     * @param newCoupon Coupon parameters captured at scheduling time.
     * @return corporateActionId_ Identifier of the underlying corporate action.
     * @return couponID_ One-indexed identifier assigned to the new coupon.
     * @return resolved_ The persisted coupon after variant-specific rate stamping (input
     *         struct unchanged for the STANDARD / KPI_LINKED variants; `rate`,
     *         `rateDecimals`, `rateStatus` overwritten for FIXED and forced to zero for NONE).
     */
    function setCoupon(
        ICouponTypes.Coupon memory newCoupon
    ) internal returns (bytes32 corporateActionId_, uint256 couponID_, ICouponTypes.Coupon memory resolved_) {
        checkEndDateAgainstMaturity(newCoupon.endDate);
        newCoupon = CouponRateDispatch.validateAndStamp(newCoupon);

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

    /**
     * @notice Reverts with `ICommonErrors.WrongDates` when the bond has a non-zero maturity date
     *         and `endDate` exceeds it.
     * @dev When `maturityDate` is zero the bond is treated as open-ended and no constraint is
     *      applied. Delegates the ordered-date check to `DatesValidation.checkDates`.
     * @param endDate Coupon end date to validate against the bond's maturity date.
     */
    function checkEndDateAgainstMaturity(uint256 endDate) internal view {
        uint256 maturityDate = BondStorageWrapper.getMaturityDate();
        if (maturityDate != 0) {
            DatesValidation.checkDates(endDate, maturityDate);
        }
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

        (uint256 resolvedRate, uint8 resolvedDecimals, bool shouldOverride) = CouponRateDispatch.resolveRate(
            couponID,
            registeredCoupon_.coupon
        );
        if (shouldOverride) {
            registeredCoupon_.coupon.rate = resolvedRate;
            registeredCoupon_.coupon.rateDecimals = resolvedDecimals;
            registeredCoupon_.coupon.rateStatus = ICouponTypes.RateCalculationStatus.SET;
        }
    }

    /**
     * @notice Returns the per-account view of a coupon, resolving the holder balance and the
     *         metadata required to compute the payable fractional amount.
     * @dev Branching by snapshot binding is load-bearing for scale correctness:
     *      - When `registeredCoupon.snapshotId != 0`, `tokenBalance`, `decimals`, `nominalValue`
     *        and `nominalValueDecimals` are all read at the snapshot scale via
     *        `SnapshotsStorageWrapper`.
     *      - Otherwise they fall back to the ABAF-adjusted state at the coupon's record date
     *        (`ERC3643StorageWrapper.getTotalBalanceForAdjustedAt`,
     *        `ERC20StorageWrapper.decimalsAdjustedAt`) and the live nominal-value pair from
     *        `NominalValueStorageWrapper`.
     *      The resolved quadruple is then handed to `_calculateCouponAmount`, which must keep
     *      the numerator and denominator at one consistent scale; passing the live nominal value
     *      pair alongside snapshot-scale balance/decimals would break that invariant — the
     *      situation reported as FIND-121.
     *      The amount block is skipped before the record date and when the coupon has been
     *      cancelled (`isDisabled == true`), leaving the default zero-valued struct.
     * @param couponID One-indexed identifier of the coupon to read.
     * @param account Holder whose snapshot balance is being measured.
     * @return couponFor_ Aggregated view including the captured balance, scale metadata, the
     *         underlying coupon parameters and the fractional payable amount.
     */
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
            couponFor_.nominalValue,
            uint8(couponFor_.nominalValueDecimals),
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
            return _couponStorage().couponsOrderedListByIds[pos];
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
        total_ = _couponStorage().couponsOrderedListByIds.length;
    }

    function getPreviousCouponInOrderedList(uint256 couponID) internal view returns (uint256 previousCouponID_) {
        uint256 orderedListLength = getCouponsOrderedListTotalAdjustedAt(TimeTravelStorageWrapper.getBlockTimestamp());

        if (orderedListLength < 2) return (0);

        if (getCouponFromOrderedListAt(0) == couponID) return (0);

        unchecked {
            --orderedListLength;
        }
        uint256 previousCouponId;

        for (uint256 i; i < orderedListLength; ) {
            previousCouponId = getCouponFromOrderedListAt(i);
            uint256 couponId = getCouponFromOrderedListAt(i + 1);
            if (couponId == couponID) return previousCouponId;

            unchecked {
                ++i;
            }
        }
        return 0;
    }

    /**
     * @notice Builds the fractional coupon amount payable to a holder once the record date is
     *         reached, expressed as `numerator / denominator` to defer rounding to the caller.
     * @dev Scale invariant: `tokenBalance`, `decimals`, `nominalValue` and `nominalValueDecimals`
     *      must all be sampled at the same point in time as the holder balance — either the
     *      snapshot bound to the coupon or the ABAF-adjusted state at the record date. The
     *      function is intentionally `pure`:
     */
    function _calculateCouponAmount(
        ICouponTypes.Coupon memory coupon,
        uint256 tokenBalance,
        uint8 decimals,
        uint256 nominalValue,
        uint8 nominalValueDecimals,
        bool recordDateReached
    ) private pure returns (ICouponTypes.CouponAmountFor memory couponAmountFor_) {
        if (!recordDateReached) return couponAmountFor_;

        uint256 period = coupon.endDate - coupon.startDate;

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
