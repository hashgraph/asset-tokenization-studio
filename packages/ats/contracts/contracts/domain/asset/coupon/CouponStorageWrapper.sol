// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { SNAPSHOT_RESULT_ID } from "../../../constants/values.sol";
import {
    CORPORATE_ACTION_TYPE_COUPON,
    SCHEDULED_TASK_TYPE_COUPON_LISTING,
    SCHEDULED_TASK_TYPE_SNAPSHOT
} from "../../../constants/dispatchTypes.sol";
import { CorporateActionsStorageWrapper } from "../../core/CorporateActionsStorageWrapper.sol";
import { ERC1410StorageWrapper } from "../ERC1410StorageWrapper.sol";
import { ERC20StorageWrapper } from "../ERC20StorageWrapper.sol";
import { TokenCoreOps } from "../../orchestrator/TokenCoreOps.sol";
import { ICoupon } from "../../../facets/coupon/ICoupon.sol";
import { ICouponTypes } from "../../../facets/coupon/ICouponTypes.sol";
import { BondStorageWrapper } from "../BondStorageWrapper.sol";
import { CouponRateDispatch } from "./CouponRateDispatch.sol";
import { DatesValidation } from "../../../infrastructure/utils/DatesValidation.sol";
import { DecimalsLib } from "../../../infrastructure/utils/DecimalsLib.sol";
import { Math } from "@openzeppelin/contracts/utils/math/Math.sol";
import { NominalValueStorageWrapper } from "../NominalValueStorageWrapper.sol";
import { Pagination } from "../../../infrastructure/utils/Pagination.sol";
import { ScheduledTasksStorageWrapper } from "../ScheduledTasksStorageWrapper.sol";
import { SnapshotsStorageWrapper } from "../SnapshotsStorageWrapper.sol";
import { TimeTravelStorageWrapper } from "../../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";

/// @custom:hash storage Coupon
bytes32 constant STORAGE_LOCATION_COUPON = 0x83419e6b8093975a3157050eb9f883164e1459426616bc1834d782d457195c00;

/**
 * @notice Coupon data stored at an ERC-7201 namespace slot.
 * @dev Tracks all issued coupon identifiers in chronological order for paginated
 *      enumeration and scheduled-task dispatch.
 * @custom:storage-location erc7201:security.token.standard.storage.Coupon
 */
struct CouponDataStorage {
    // ─── R4 Aggregates (mapping, array, EnumerableSet) ───────
    uint256[] couponsOrderedListByIds;
    // ─── APPEND-ONLY ZONE BELOW ───
}

/// @title Coupon Storage Wrapper
/// @notice Library for managing Coupon storage operations.
/// @dev Provides structured access to CouponDataStorage at a dedicated storage slot.
/// @author Asset Tokenization Studio Team
library CouponStorageWrapper {
    /**
     * @notice Persists a new coupon corporate action and schedules its snapshot/listing
     *         tasks. Variant invariants and rate stamping are delegated to
     *         `CouponRateDispatch.validateAndStamp`, which mirrors the deferred dispatch
     *         performed by `getCoupon` on the read path.
     * @dev The end-date-against-maturity constraint is enforced by the caller before this
     *      function is invoked (see `CouponModifiers.onlyValidCouponEndDate`).
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
        newCoupon = CouponRateDispatch.validateAndStamp(newCoupon);

        (corporateActionId_, couponID_) = CorporateActionsStorageWrapper.addCorporateAction(
            CORPORATE_ACTION_TYPE_COUPON,
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

    /**
     * @notice Cancels a coupon unconditionally, bypassing the execution-date guard.
     * @dev Use when administrative override is required after the execution date has passed.
     *      Delegates to `CorporateActionsStorageWrapper.cancelCorporateAction` directly.
     * @param couponId One-indexed identifier of the coupon to cancel.
     * @return success_ Always true if no revert occurred.
     */
    function forceCancelCoupon(uint256 couponId) internal returns (bool success_) {
        bytes32 corporateActionId;
        (, corporateActionId, ) = getCoupon(couponId);
        CorporateActionsStorageWrapper.cancelCorporateAction(corporateActionId);
        success_ = true;
    }

    /**
     * @notice Schedules snapshot and optional coupon-listing tasks for a newly
     *         persisted coupon.
     * @dev Reverts if `actionId` is zero (indicates prior corporate-action creation
     *      failure). When `fixingDate` is zero (indicating a non-rate-fixing coupon),
     *      the listing task is skipped.
     * @param actionId The corporate-action identifier returned by
     *         `CorporateActionsStorageWrapper.addCorporateAction`.
     * @param newCoupon The coupon parameters containing `recordDate` and optionally
     *         `fixingDate`.
     */
    function initCoupon(bytes32 actionId, ICouponTypes.Coupon memory newCoupon) internal {
        if (actionId == bytes32(0)) {
            revert ICoupon.CouponCreationFailed();
        }
        ScheduledTasksStorageWrapper.addScheduledCrossOrderedTask(newCoupon.recordDate, SCHEDULED_TASK_TYPE_SNAPSHOT);
        ScheduledTasksStorageWrapper.addScheduledSnapshot(newCoupon.recordDate, actionId);
        if (newCoupon.fixingDate == 0) return;
        ScheduledTasksStorageWrapper.addScheduledCrossOrderedTask(
            newCoupon.fixingDate,
            SCHEDULED_TASK_TYPE_COUPON_LISTING
        );
        ScheduledTasksStorageWrapper.addScheduledCouponListing(newCoupon.fixingDate, actionId);
    }

    /**
     * @notice Records a coupon identifier in chronological order after creation.
     * @dev Appends to the ordered list, supporting pagination and traversal of all
     *      issued coupons.
     * @param couponID One-indexed coupon identifier to append.
     */
    function addToCouponsOrderedList(uint256 couponID) internal {
        _couponStorage().couponsOrderedListByIds.push(couponID);
    }

    /**
     * @notice Stamps a resolved fixed-rate value and decimals onto a previously
     *         scheduled coupon.
     * @dev Mutates the supplied `coupon` struct in memory and persists it via
     *      `CorporateActionsStorageWrapper.updateCorporateActionData`. Rate status
     *      is transitioned to SET.
     * @param couponID One-indexed coupon identifier.
     * @param coupon In-memory coupon struct modified by reference.
     * @param rate Fixed-rate numerator resolved by `CouponRateDispatch`.
     * @param rateDecimals Scale of the rate value.
     */
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
            CorporateActionsStorageWrapper.getCorporateActionIdByTypeIndex(CORPORATE_ACTION_TYPE_COUPON, couponID - 1),
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

    /**
     * @notice Returns the raw coupon data and its corporate-action metadata without resolving
     *         the rate.
     * @dev Reads the coupon struct directly from the encoded corporate-action data without
     *      triggering `CouponRateDispatch.resolveRate`. Used by callers that need raw
     *      coupon fields (e.g. fixing dates, record dates) but must not trigger recursive rate
     *      resolution — in particular `KpisStorageWrapper.setMinDate`, which is called from
     *      within the KPI rate-resolution path and would loop if it called the full
     *      `getCoupon`.
     * @param couponID One-indexed coupon identifier.
     * @return rawCoupon_ The coupon struct as stored, without rate resolution.
     * @return corporateActionId_ The underlying corporate-action identifier.
     * @return isDisabled_ True if the coupon has been cancelled.
     */
    function getRawCouponData(
        uint256 couponID
    ) internal view returns (ICouponTypes.Coupon memory rawCoupon_, bytes32 corporateActionId_, bool isDisabled_) {
        corporateActionId_ = CorporateActionsStorageWrapper.getCorporateActionIdByTypeIndex(
            CORPORATE_ACTION_TYPE_COUPON,
            couponID - 1
        );
        bytes memory data;
        (, , data, isDisabled_) = CorporateActionsStorageWrapper.getCorporateAction(corporateActionId_);

        if (data.length == 0) revert ICoupon.CouponNotFound(couponID);
        rawCoupon_ = abi.decode(data, (ICouponTypes.Coupon));
    }

    /**
     * @notice Fetches a coupon by one-indexed identifier, resolving its rate if
     *         deferred and the fixing date has passed.
     * @dev Returns the coupon's associated corporate-action identifier and
     *      cancellation flag. For STANDARD and KPI_LINKED coupons, or when the
     *      fixing date has not yet occurred, returns the coupon unchanged.
     *      For FIXED and NONE coupons, or when rate resolution applies,
     *      delegates to `CouponRateDispatch.resolveRate` to compute the
     *      effective rate and optionally update it in-memory.
     * @param couponID One-indexed coupon identifier.
     * @return registeredCoupon_ The coupon and its snapshot binding, with rate
     *         resolved if applicable.
     * @return corporateActionId_ The underlying corporate-action identifier.
     * @return isDisabled_ True if the coupon has been cancelled.
     */
    function getCoupon(
        uint256 couponID
    )
        internal
        view
        returns (ICouponTypes.RegisteredCoupon memory registeredCoupon_, bytes32 corporateActionId_, bool isDisabled_)
    {
        (registeredCoupon_.coupon, corporateActionId_, isDisabled_) = getRawCouponData(couponID);

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
     *        (`TokenCoreOps.getTotalBalanceForAdjustedAt`,
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
                couponFor_.tokenBalance = TokenCoreOps.getTotalBalanceForAdjustedAt(
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

    /**
     * @notice Returns only the fractional amount payable to an account under a
     *         coupon, extracting from the full coupon view.
     * @dev Delegates to `getCouponFor` and unwraps its `couponAmount` member.
     * @param couponID One-indexed coupon identifier.
     * @param account Holder whose payable amount is being queried.
     * @return couponAmountFor_ Numerator and denominator representing the holder's
     *         fractional coupon payable.
     */
    function getCouponAmountFor(
        uint256 couponID,
        address account
    ) internal view returns (ICouponTypes.CouponAmountFor memory couponAmountFor_) {
        return getCouponFor(couponID, account).couponAmount;
    }

    /**
     * @notice Returns the total number of coupons ever issued.
     * @dev Queries the underlying corporate-action store for coupons only.
     * @return couponCount_ The count of all coupons (both active and cancelled).
     */
    function getCouponCount() internal view returns (uint256 couponCount_) {
        return CorporateActionsStorageWrapper.getCorporateActionCountByType(CORPORATE_ACTION_TYPE_COUPON);
    }

    /**
     * @notice Returns the paginated list of holders eligible for a coupon,
     *         resolved from snapshot or live state.
     * @dev Before the record date, returns an empty array. If the coupon has a
     *      snapshot binding, reads the paginated holders at that snapshot;
     *      otherwise reads from the current ERC-1410 state. Pagination is applied
     *      at the snapshot or live level respectively.
     * @param couponID One-indexed coupon identifier.
     * @param pageIndex Zero-indexed page to retrieve.
     * @param pageLength Number of holders per page.
     * @return holders_ Array of holder addresses on the requested page.
     */
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

    /**
     * @notice Returns the total count of holders eligible for a coupon at its
     *         record date.
     * @dev Returns zero if the record date has not yet been reached. If a snapshot
     *      is bound, returns the snapshot's holder count; otherwise returns the
     *      current ERC-1410 holder count.
     * @param couponID One-indexed coupon identifier.
     * @return total_ The number of token holders eligible for coupon payment.
     */
    function getTotalCouponHolders(uint256 couponID) internal view returns (uint256 total_) {
        (ICouponTypes.RegisteredCoupon memory registeredCoupon, , ) = getCoupon(couponID);

        if (registeredCoupon.coupon.recordDate >= TimeTravelStorageWrapper.getBlockTimestamp()) return 0;

        if (registeredCoupon.snapshotId != 0)
            return SnapshotsStorageWrapper.totalTokenHoldersAt(registeredCoupon.snapshotId);

        return ERC1410StorageWrapper.getTotalTokenHolders();
    }

    /**
     * @notice Retrieves a coupon identifier at a specific position in the
     *         chronologically-ordered, time-adjusted list.
     * @dev Operates in two regions: if position is within the executed coupons,
     *      reads from storage; otherwise reads from pending scheduled tasks,
     *      traversing in reverse order. Returns zero if position is out of bounds.
     * @param pos Zero-indexed position in the adjusted ordered list.
     * @param _includeDisabled Whether to include disabled coupons in the traversal.
     * @return couponID_ The coupon identifier at that position, or zero if out
     *         of bounds.
     */
    function getCouponFromOrderedListAt(uint256 pos, bool _includeDisabled) internal view returns (uint256 couponID_) {
        if (pos >= getCouponsOrderedListTotalAdjustedAt(TimeTravelStorageWrapper.getBlockTimestamp(), _includeDisabled))
            return 0;

        uint256 actualOrderedListLengthTotal = getCouponsOrderedListTotal();
        if (pos < actualOrderedListLengthTotal) {
            return _couponStorage().couponsOrderedListByIds[pos];
        }

        uint256 pendingIndexOffset = pos - actualOrderedListLengthTotal;

        if (_includeDisabled) {
            return
                ScheduledTasksStorageWrapper.getScheduledCouponListingIdAtIndex(
                    ScheduledTasksStorageWrapper.getScheduledCouponListingCount(true) - 1 - pendingIndexOffset
                );
        }

        // When excluding disabled, iterate the queue skipping disabled tasks to find the
        // correct coupon at the filtered pending index.
        uint256 seen;
        for (uint256 j = ScheduledTasksStorageWrapper.getScheduledCouponListingCount(true); j > 0; ) {
            unchecked {
                --j;
            }
            if (ScheduledTasksStorageWrapper.isScheduledCouponListingDisabledAtIndex(j)) continue;
            if (seen != pendingIndexOffset) {
                unchecked {
                    ++seen;
                }
                continue;
            }
            return ScheduledTasksStorageWrapper.getScheduledCouponListingIdAtIndex(j);
        }
    }

    /**
     * @notice Returns a paginated slice of the chronologically-ordered coupon list,
     *         including both executed and pending (scheduled) coupons.
     * @dev Computes page boundaries and populates the result array by calling
     *      `getCouponFromOrderedListAt` for each position.
     * @param pageIndex Zero-indexed page to retrieve.
     * @param pageLength Number of coupons per page.
     * @return couponIDs_ Array of coupon identifiers on the requested page.
     */
    function getCouponsOrderedList(
        uint256 pageIndex,
        uint256 pageLength,
        bool _includeDisabled
    ) internal view returns (uint256[] memory couponIDs_) {
        (uint256 start, uint256 end) = Pagination.getStartAndEnd(pageIndex, pageLength);

        couponIDs_ = new uint256[](
            Pagination.getSize(
                start,
                end,
                getCouponsOrderedListTotalAdjustedAt(TimeTravelStorageWrapper.getBlockTimestamp(), _includeDisabled)
            )
        );

        uint256 length = couponIDs_.length;
        for (uint256 i; i < length; ) {
            unchecked {
                couponIDs_[i] = getCouponFromOrderedListAt(start + i, _includeDisabled);
                ++i;
            }
        }
    }

    /**
     * @notice Returns the combined count of executed and pending coupons at a given
     *         timestamp.
     * @dev Sums the stored coupon count with the pending scheduled-coupon-listing
     *      count at the specified time.
     * @param timestamp The point in time at which to measure pending coupons.
     * @param _includeDisabled Whether to include disabled coupons in the count.
     * @return total_ The adjusted total coupon count (executed + pending at
     *         timestamp).
     */
    function getCouponsOrderedListTotalAdjustedAt(
        uint256 timestamp,
        bool _includeDisabled
    ) internal view returns (uint256 total_) {
        return
            getCouponsOrderedListTotal() +
            ScheduledTasksStorageWrapper.getPendingScheduledCouponListingTotalAt(timestamp, _includeDisabled);
    }

    /**
     * @notice Returns the count of executed coupons only.
     * @dev Queries the length of the stored ordered list, excluding pending
     *      scheduled tasks.
     * @return total_ The number of executed coupons.
     */
    function getCouponsOrderedListTotal() internal view returns (uint256 total_) {
        total_ = _couponStorage().couponsOrderedListByIds.length;
    }

    /**
     * @notice Returns the coupon identifier immediately preceding a given coupon in
     *         the ordered list.
     * @dev Linearly searches the ordered list for the target coupon and returns its
     *      predecessor. Returns zero if the coupon is not found, is the first in
     *      the list, or the list contains fewer than two coupons.
     * @param couponID One-indexed coupon identifier to search for.
     * @param _includeDisabled Whether to include disabled coupons in the traversal.
     * @return previousCouponID_ The identifier of the preceding coupon, or zero if
     *         not applicable.
     */
    function getPreviousCouponInOrderedList(
        uint256 couponID,
        bool _includeDisabled
    ) internal view returns (uint256 previousCouponID_) {
        uint256 orderedListLength = getCouponsOrderedListTotalAdjustedAt(
            TimeTravelStorageWrapper.getBlockTimestamp(),
            _includeDisabled
        );

        if (orderedListLength < 2) return (0);

        if (getCouponFromOrderedListAt(0, _includeDisabled) == couponID) return (0);

        unchecked {
            --orderedListLength;
        }
        uint256 previousCouponId;

        for (uint256 i; i < orderedListLength; ) {
            previousCouponId = getCouponFromOrderedListAt(i, _includeDisabled);
            uint256 couponId = getCouponFromOrderedListAt(i + 1, _includeDisabled);
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
     *      function is intentionally `pure`; no recomputation occurs after record date.
     * @param coupon The coupon parameters defining rate, scale, and period.
     * @param tokenBalance Holder's token balance at the record date.
     * @param decimals Token decimal scale.
     * @param nominalValue Nominal value per token at the record date.
     * @param nominalValueDecimals Nominal value decimal scale.
     * @param recordDateReached True if the coupon's record date has passed.
     * @return couponAmountFor_ Numerator and denominator of the payable amount;
     *         both zero if the record date has not yet been reached.
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
        // Staged multiplication: pre-apply the nominal-value scale via 512-bit mulDiv so the
        // numerator never materialises the full four-way product. The resulting fraction is
        // mathematically equivalent to the original (balance * nominal * rate * period) /
        // (10**(d+nd+rd) * 365 days), redistributed to keep every intermediate within uint256.
        uint256 balanceNominalScaled = Math.mulDiv(tokenBalance, nominalValue, DecimalsLib.pow10(nominalValueDecimals));
        couponAmountFor_.numerator = balanceNominalScaled * coupon.rate * period;
        couponAmountFor_.denominator = DecimalsLib.pow10(uint256(decimals) + coupon.rateDecimals) * 365 days;
    }

    /**
     * @notice Loads the coupon storage struct from its ERC-7201 namespace slot.
     * @dev Uses inline assembly to set the storage slot for the returned reference,
     *      allowing access to the coupon data at its designated storage location.
     * @return cs_ A storage reference to `CouponDataStorage` at the ERC-7201 slot.
     */
    // solhint-disable-next-line func-name-mixedcase
    function _couponStorage() private pure returns (CouponDataStorage storage cs_) {
        bytes32 position = STORAGE_LOCATION_COUPON;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            cs_.slot := position
        }
    }
}
