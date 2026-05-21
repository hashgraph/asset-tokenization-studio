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
import { TokenCoreOps } from "../../orchestrator/TokenCoreOps.sol";
import { ICoupon } from "../../../facets/coupon/ICoupon.sol";
import { ICouponTypes } from "../../../facets/coupon/ICouponTypes.sol";
import { BondStorageWrapper } from "../BondStorageWrapper.sol";
import { CouponRateDispatch } from "./CouponRateDispatch.sol";
import { DatesValidation } from "../../../infrastructure/utils/DatesValidation.sol";
import { DecimalsLib } from "../../../infrastructure/utils/DecimalsLib.sol";
import { Math } from "@openzeppelin/contracts/utils/math/Math.sol";
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
    /**
     * @notice Diamond-storage layout for coupon-specific data.
     * @dev Stored at `_COUPON_STORAGE_POSITION` via `_couponStorage()`. The ordered list
     *      is grown only for coupons whose rate is already `SET`; pending entries are tracked
     *      separately by `ScheduledTasksStorageWrapper`.
     */
    struct CouponDataStorage {
        uint256[] couponsOrderedListByIds;
    }

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
     * @notice Schedules the snapshot and optional coupon-listing tasks for a newly created coupon
     *         corporate action.
     * @dev Reverts with `ICoupon.CouponCreationFailed` if `actionId` is zero. Registers a
     *      cross-ordered snapshot task at `newCoupon.recordDate`. If `fixingDate > 0`, also
     *      schedules a coupon-listing task at that date via `ScheduledTasksStorageWrapper`.
     * @param actionId  The corporate action identifier (must be non-zero).
     * @param newCoupon The coupon parameters used to determine scheduling dates.
     */
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

    /**
     * @notice Appends `couponID` to the persistent ordered coupon list in storage.
     * @dev The list is grown only when a coupon's rate becomes `SET`; pending coupons are
     *      tracked through `ScheduledTasksStorageWrapper` instead. Called by the coupon-listing
     *      scheduled task executor.
     * @param couponID One-indexed identifier of the coupon to append.
     */
    function addToCouponsOrderedList(uint256 couponID) internal {
        _couponStorage().couponsOrderedListByIds.push(couponID);
    }

    /**
     * @notice Persists a resolved coupon rate and marks the rate status as `SET`.
     * @dev Writes the updated coupon bytes back via
     *      `CorporateActionsStorageWrapper.updateCorporateActionData`. Called by the
     *      KPI-linked and variable-rate dispatch paths once the external rate is known.
     * @param couponID     One-indexed identifier of the coupon to update.
     * @param coupon       The full in-memory coupon struct to mutate and re-encode.
     * @param rate         The resolved rate value.
     * @param rateDecimals Decimal precision of `rate`.
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

    /**
     * @notice Fetches the raw (unresolved) coupon data, corporate action ID, and disabled status
     *         for a given coupon without applying deferred rate resolution.
     * @dev Unlike `getCoupon`, this function does not call `CouponRateDispatch.resolveRate` and
     *      does not populate `snapshotId`. Use when only the stored bytes are needed.
     *      Reverts with `ICoupon.CouponNotFound` if no data is stored.
     * @param couponID             One-indexed identifier of the coupon to retrieve.
     * @return rawCoupon_          Decoded coupon struct as stored, without rate resolution.
     * @return corporateActionId_  Underlying corporate action identifier.
     * @return isDisabled_         True if the coupon has been cancelled.
     */
    function getRawCouponData(
        uint256 couponID
    ) internal view returns (ICouponTypes.Coupon memory rawCoupon_, bytes32 corporateActionId_, bool isDisabled_) {
        corporateActionId_ = CorporateActionsStorageWrapper.getCorporateActionIdByTypeIndex(
            COUPON_CORPORATE_ACTION_TYPE,
            couponID - 1
        );
        bytes memory data;
        (, , data, isDisabled_) = CorporateActionsStorageWrapper.getCorporateAction(corporateActionId_);

        if (data.length == 0) revert ICoupon.CouponNotFound(couponID);
        rawCoupon_ = abi.decode(data, (ICouponTypes.Coupon));
    }

    /**
     * @notice Retrieves the registered coupon record, corporate action ID, and disabled status.
     * @dev Resolves the corporate action ID by type index, decodes the stored coupon bytes, and
     *      reads the associated snapshot result ID. Applies deferred rate resolution via
     *      `CouponRateDispatch.resolveRate` when the fixing date has passed and the rate is not
     *      yet `SET`. Reverts with `ICoupon.CouponNotFound` if no data is stored.
     * @param couponID              One-indexed identifier of the coupon to retrieve.
     * @return registeredCoupon_   Decoded coupon with snapshot ID and resolved rate.
     * @return corporateActionId_  Underlying corporate action identifier.
     * @return isDisabled_         True if the coupon has been cancelled.
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
     * @notice Returns only the fractional payable amount from `getCouponFor`.
     * @dev Convenience wrapper that discards the rest of the `CouponFor` struct.
     * @param couponID One-indexed identifier of the coupon.
     * @param account  Holder address to compute the amount for.
     * @return couponAmountFor_ The payable fraction (`numerator / denominator`) and
     *                          the `recordDateReached` flag.
     */
    function getCouponAmountFor(
        uint256 couponID,
        address account
    ) internal view returns (ICouponTypes.CouponAmountFor memory couponAmountFor_) {
        return getCouponFor(couponID, account).couponAmount;
    }

    /**
     * @notice Returns the total number of coupon corporate actions ever created.
     * @dev Delegates to `CorporateActionsStorageWrapper.getCorporateActionCountByType`.
     * @return couponCount_ Total count of registered coupons.
     */
    function getCouponCount() internal view returns (uint256 couponCount_) {
        return CorporateActionsStorageWrapper.getCorporateActionCountByType(COUPON_CORPORATE_ACTION_TYPE);
    }

    /**
     * @notice Returns a paginated list of token holders eligible for a coupon payment.
     * @dev Returns an empty array before the record date. After the record date, holders are
     *      sourced from the bound snapshot when one exists, otherwise from the live ERC1410
     *      holder set.
     * @param couponID   One-indexed identifier of the coupon.
     * @param pageIndex  Zero-based page index.
     * @param pageLength Maximum number of addresses per page.
     * @return holders_  Paginated array of eligible holder addresses.
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
     * @notice Returns the total number of token holders eligible for a coupon payment.
     * @dev Mirrors `getCouponHolders` logic but returns a count. Returns zero before the record
     *      date.
     * @param couponID One-indexed identifier of the coupon.
     * @return total_  Total number of eligible holders.
     */
    function getTotalCouponHolders(uint256 couponID) internal view returns (uint256 total_) {
        (ICouponTypes.RegisteredCoupon memory registeredCoupon, , ) = getCoupon(couponID);

        if (registeredCoupon.coupon.recordDate >= TimeTravelStorageWrapper.getBlockTimestamp()) return 0;

        if (registeredCoupon.snapshotId != 0)
            return SnapshotsStorageWrapper.totalTokenHoldersAt(registeredCoupon.snapshotId);

        return ERC1410StorageWrapper.getTotalTokenHolders();
    }

    /**
     * @notice Returns the coupon ID at position `pos` in the time-ordered list, including
     *         coupons still pending their fixing date.
     * @dev Returns zero when `pos` is beyond the total adjusted at block timestamp. Positions
     *      within the persisted list are served from `couponsOrderedListByIds`; positions beyond
     *      it are served from `ScheduledTasksStorageWrapper` in reverse insertion order.
     * @param pos        Zero-based position in the ordered list.
     * @return couponID_ The coupon identifier at `pos`, or zero if out of range.
     */
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

    /**
     * @notice Returns a paginated slice of the time-ordered coupon list.
     * @dev Combines the persisted list with pending scheduled coupons via
     *      `getCouponFromOrderedListAt`. Total size is obtained from
     *      `getCouponsOrderedListTotalAdjustedAt` at the current block timestamp.
     * @param pageIndex  Zero-based page index.
     * @param pageLength Maximum number of coupon IDs per page.
     * @return couponIDs_ Ordered array of coupon identifiers for the requested page.
     */
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

    /**
     * @notice Returns the total number of coupons in the ordered list at `timestamp`, including
     *         those still pending their fixing date.
     * @dev Sums the persisted list length and the pending scheduled coupon-listing count at
     *      `timestamp` from `ScheduledTasksStorageWrapper`.
     * @param timestamp The block timestamp used to evaluate pending coupons.
     * @return total_   Combined total of committed and pending coupon entries.
     */
    function getCouponsOrderedListTotalAdjustedAt(uint256 timestamp) internal view returns (uint256 total_) {
        return
            getCouponsOrderedListTotal() +
            ScheduledTasksStorageWrapper.getPendingScheduledCouponListingTotalAt(timestamp);
    }

    /**
     * @notice Returns the number of coupons committed to the persistent ordered list (i.e. whose
     *         rate is already `SET`).
     * @dev Reads `couponsOrderedListByIds.length` directly from diamond storage.
     * @return total_ Length of the committed ordered coupon list.
     */
    function getCouponsOrderedListTotal() internal view returns (uint256 total_) {
        total_ = _couponStorage().couponsOrderedListByIds.length;
    }

    /**
     * @notice Finds the coupon immediately preceding `couponID` in the time-ordered list.
     * @dev Iterates the ordered list (including pending entries) in ascending order and returns
     *      the element just before the one matching `couponID`. Returns zero when the list has
     *      fewer than two entries or when `couponID` is the first entry.
     *      Gas cost scales linearly with list length — avoid in hot paths.
     * @param couponID           One-indexed identifier of the coupon whose predecessor is sought.
     * @return previousCouponID_ Identifier of the preceding coupon, or zero if none.
     */
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
     *      snapshot bound to the coupon or the ABAF-adjusted state at the record date.
     * @param coupon               The coupon struct supplying rate, decimals, and period dates.
     * @param tokenBalance         Holder's token balance at the record date.
     * @param decimals             Token decimals at the record date.
     * @param nominalValue         Nominal value of the token at the record date.
     * @param nominalValueDecimals Decimal precision of `nominalValue`.
     * @param recordDateReached    Whether the coupon's record date has passed.
     * @return couponAmountFor_    Payable fraction (`numerator / denominator`) and
     *                             `recordDateReached` flag.
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
     * @notice Returns a storage pointer to `CouponDataStorage` at the dedicated slot.
     * @dev Uses inline assembly with the diamond-storage pattern to load the struct pointer at
     *      `_COUPON_STORAGE_POSITION`.
     * @return cs_ Storage reference to the coupon data layout.
     */
    // solhint-disable-next-line func-name-mixedcase
    function _couponStorage() private pure returns (CouponDataStorage storage cs_) {
        bytes32 position = _COUPON_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            cs_.slot := position
        }
    }
}
