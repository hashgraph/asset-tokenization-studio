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
import { ICoupon } from "../../../facets/layer_2/coupon/ICoupon.sol";
import { ICouponTypes } from "../../../facets/layer_2/coupon/ICouponTypes.sol";
import { InterestRateStorageWrapper } from "../InterestRateStorageWrapper.sol";
import { KpiLinkedRateLib } from "../KpiLinkedRateLib.sol";
import { NominalValueStorageWrapper } from "../nominalValue/NominalValueStorageWrapper.sol";
import { Pagination } from "../../../infrastructure/utils/Pagination.sol";
import { SustainabilityPerformanceTargetRateLib } from "../SustainabilityPerformanceTargetRateLib.sol";
import { ScheduledTasksStorageWrapper } from "../ScheduledTasksStorageWrapper.sol";
import { SnapshotsStorageWrapper } from "../SnapshotsStorageWrapper.sol";
import { TimeTravelStorageWrapper } from "../../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { _COUPON_STORAGE_POSITION } from "../../../constants/storagePositions.sol";

/**
 * @title  CouponStorageWrapper
 * @notice Internal library for registering, mutating, and querying bond coupon data
 *         using the Diamond Storage Pattern.
 * @dev    Anchors `CouponDataStorage` at `_COUPON_STORAGE_POSITION` following ERC-2535.
 *         All functions are `internal` and intended exclusively for use within facets or
 *         other internal libraries of the same diamond.
 *
 *         Coupons are registered as corporate actions of type `COUPON_CORPORATE_ACTION_TYPE`
 *         via `CorporateActionsStorageWrapper`. Coupon IDs are one-based sequential indices
 *         within that action type; callers must never pass `0` as a coupon ID.
 *
 *         The ordered list of coupons is composed from three sources in priority order:
 *           1. Deprecated legacy entries from `BondStorageWrapper`.
 *           2. Active entries in `CouponDataStorage.couponsOrderedListByIds`.
 *           3. Pending scheduled coupon listings not yet promoted to the active list.
 *         This layered design preserves backwards compatibility whilst supporting
 *         forward-scheduled coupons.
 *
 *         Rate calculation at read time supports three modes, applied in this priority:
 *           1. Sustainability Performance Target rate (if initialised).
 *           2. KPI-linked rate (if initialised).
 *           3. Statically stored rate (default; already marked `SET`).
 *         Rate results are not persisted by `getCoupon`; they are computed on each call
 *         until `updateCouponRate` writes them back to storage.
 *
 *         Block timestamps are sourced from `TimeTravelStorageWrapper` to support
 *         test-environment time manipulation without affecting production logic.
 * @author Hashgraph
 */
library CouponStorageWrapper {
    /**
     * @notice Diamond Storage struct holding the active portion of the coupon ordered list.
     * @dev    Legacy entries preceding this struct's deployment are stored separately in
     *         `BondStorageWrapper` and are transparently prepended during reads. The array
     *         grows monotonically; entries are never removed.
     * @param couponsOrderedListByIds  Append-only array of coupon IDs in chronological
     *                                 registration order, excluding deprecated legacy entries.
     */
    struct CouponDataStorage {
        uint256[] couponsOrderedListByIds;
    }

    /**
     * @notice Registers a new coupon as a corporate action and schedules its associated
     *         tasks, then emits `ICoupon.CouponSet`.
     * @dev    Delegates corporate action creation to `CorporateActionsStorageWrapper
     *         .addCorporateAction` with type `COUPON_CORPORATE_ACTION_TYPE`. A duplicate
     *         submission (identical `actionType` and `data` hash) returns `(bytes32(0), 0)`
     *         from the underlying layer without reverting; callers should check for a zero
     *         return if idempotency guarantees are required.
     *         Scheduling side-effects are applied via `initCoupon`; see that function for
     *         task registration details.
     *         Emits: `ICoupon.CouponSet`.
     * @param newCoupon          Coupon parameters to register.
     * @return corporateActionId_ Diamond-level corporate action identifier for the coupon.
     * @return couponID_          One-based sequential coupon ID within the coupon action type.
     */
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

    /**
     * @notice Marks a coupon as cancelled provided it has not yet been executed, then
     *         emits `ICoupon.CouponCancelled`.
     * @dev    Resolves the corporate action ID by calling `getCoupon` with `couponId`.
     *         Reverts with `ICoupon.CouponAlreadyExecuted` if `executionDate` is non-zero
     *         and has already passed relative to `TimeTravelStorageWrapper.getBlockTimestamp`.
     *         Coupons with `executionDate == 0` (unscheduled for execution) are always
     *         cancellable. Cancellation delegates to `CorporateActionsStorageWrapper
     *         .cancelCorporateAction`, which sets `isDisabled = true` irreversibly at the
     *         storage layer.
     *         Emits: `ICoupon.CouponCancelled`.
     * @param couponId  One-based sequential coupon ID to cancel.
     * @return success_ Always `true` on successful cancellation.
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
        emit ICoupon.CouponCancelled(couponId, EvmAccessors.getMsgSender());
    }

    /**
     * @notice Schedules the snapshot and, if applicable, the coupon listing tasks
     *         associated with a newly registered coupon.
     * @dev    Reverts with `ICoupon.CouponCreationFailed` if `actionId` is `bytes32(0)`,
     *         which indicates a duplicate registration was silently rejected upstream.
     *         Always schedules a cross-ordered snapshot task and a snapshot entry at
     *         `newCoupon.recordDate`. If `fixingDate` is non-zero, additionally schedules a
     *         cross-ordered coupon listing task and a coupon listing entry at that date.
     *         This function must only be called immediately after a successful
     *         `addCorporateAction` invocation; calling it independently with an arbitrary
     *         `actionId` will create orphaned scheduled tasks.
     * @param actionId   Corporate action ID returned by the upstream registration call.
     * @param newCoupon  Coupon parameters providing `recordDate` and `fixingDate`.
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
     * @notice Appends a coupon ID to the active portion of the coupon ordered list.
     * @dev    Writes directly to `CouponDataStorage.couponsOrderedListByIds`. This list
     *         grows monotonically; no deduplication is enforced. Callers are responsible
     *         for ensuring `couponID` is a valid, previously registered coupon ID and that
     *         ordering semantics are preserved at the call site.
     * @param couponID  One-based sequential coupon ID to append.
     */
    function addToCouponsOrderedList(uint256 couponID) internal {
        _couponStorage().couponsOrderedListByIds.push(couponID);
    }

    /**
     * @notice Overwrites the rate fields of an existing coupon's stored payload and marks
     *         its rate status as `SET`.
     * @dev    Mutates `coupon` in memory before ABI-encoding and writing back to the
     *         corporate action data store. The target action is resolved by treating
     *         `couponID - 1` as the zero-based type index within `COUPON_CORPORATE_ACTION_TYPE`.
     *         This does not update the content hash index in `CorporateActionsStorageWrapper`,
     *         so duplicate-prevention semantics no longer reflect the live payload after
     *         this call.
     * @param couponID      One-based sequential coupon ID whose rate is to be updated.
     * @param coupon        In-memory coupon struct to be mutated and persisted.
     * @param rate          New interest rate value to store.
     * @param rateDecimals  Decimal precision of the new rate.
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
     * @notice Returns the full registered coupon record for a given coupon ID, applying
     *         dynamic rate calculation if the fixing date has passed and the rate is not
     *         yet marked as `SET`.
     * @dev    Resolves the corporate action ID using `couponID - 1` as the zero-based type
     *         index. Reverts with `ICoupon.CouponNotFound` if no data is stored for the
     *         resolved ID.
     *
     *         Rate resolution priority at read time (only when `fixingDate` is non-zero,
     *         `rateStatus != SET`, and `fixingDate <= block.timestamp`):
     *           1. Sustainability Performance Target rate, if that module is initialised.
     *           2. KPI-linked rate, if that module is initialised.
     *           3. Stored rate is returned unchanged if neither module is initialised.
     *         Computed rates are reflected in the returned struct but are NOT persisted;
     *         callers must invoke `updateCouponRate` to write them back.
     *
     *         `snapshotId` is populated from the corporate action's result at
     *         `SNAPSHOT_RESULT_ID`; a value of `0` indicates the snapshot has not yet
     *         been recorded.
     * @param couponID  One-based sequential coupon ID to retrieve.
     * @return registeredCoupon_  Full coupon record including resolved rate and snapshot ID.
     * @return corporateActionId_ Underlying corporate action identifier for the coupon.
     * @return isDisabled_        True if the coupon has been cancelled.
     */
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

    /**
     * @notice Returns the coupon details and computed coupon amount owed to a specific
     *         account, based on their token balance at the coupon's record date.
     * @dev    Calls `getCoupon` internally. Balance resolution depends on the snapshot
     *         state at the record date:
     *           - If `snapshotId != 0`, the historical snapshot balance is used.
     *           - If `snapshotId == 0`, the live adjusted balance at the current timestamp
     *             is read from `ERC3643StorageWrapper`.
     *         Token decimals are sourced from `ERC20StorageWrapper.decimalsAdjustedAt` for
     *         the current timestamp. Balance and amount fields are only populated once
     *         `recordDate` has passed and the coupon is not disabled.
     *         Amount calculation delegates to `_calculateCouponAmount`.
     * @param couponID  One-based sequential coupon ID to query.
     * @param account   Address for which the coupon entitlement is computed.
     * @return couponFor_  Struct containing coupon metadata, balance, decimals, nominal
     *                     value, and the computed coupon amount for `account`.
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

    /**
     * @notice Returns only the computed coupon amount owed to a specific account for a
     *         given coupon.
     * @dev    Convenience accessor that delegates entirely to `getCouponFor` and extracts
     *         the `couponAmount` field. Inherits all preconditions and balance resolution
     *         logic from that function.
     * @param couponID  One-based sequential coupon ID to query.
     * @param account   Address for which the coupon amount is computed.
     * @return couponAmountFor_  Struct containing the numerator, denominator, and record
     *                           date flag for the computed coupon entitlement.
     */
    function getCouponAmountFor(
        uint256 couponID,
        address account
    ) internal view returns (ICouponTypes.CouponAmountFor memory couponAmountFor_) {
        return getCouponFor(couponID, account).couponAmount;
    }

    /**
     * @notice Returns the total number of coupons registered under the coupon corporate
     *         action type.
     * @dev    Delegates to `CorporateActionsStorageWrapper.getCorporateActionCountByType`
     *         with `COUPON_CORPORATE_ACTION_TYPE`; O(1) gas cost.
     * @return couponCount_  Total number of registered coupons.
     */
    function getCouponCount() internal view returns (uint256 couponCount_) {
        return CorporateActionsStorageWrapper.getCorporateActionCountByType(COUPON_CORPORATE_ACTION_TYPE);
    }

    /**
     * @notice Returns a paginated list of token holder addresses eligible for a given
     *         coupon, based on balances at the coupon's record date.
     * @dev    Returns an empty array without reverting if the record date has not yet been
     *         reached relative to `TimeTravelStorageWrapper.getBlockTimestamp`.
     *         Holder resolution depends on the snapshot state:
     *           - If `snapshotId != 0`, holders are sourced from `SnapshotsStorageWrapper`.
     *           - If `snapshotId == 0`, the live ERC1410 holder set is returned instead.
     * @param couponID    One-based sequential coupon ID to query.
     * @param pageIndex   Zero-based page number to retrieve.
     * @param pageLength  Maximum number of addresses to return per page.
     * @return holders_   Paginated array of eligible token holder addresses.
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
     * @notice Returns the total number of token holders eligible for a given coupon at its
     *         record date.
     * @dev    Returns `0` without reverting if the record date has not yet been reached.
     *         Holder count resolution mirrors `getCouponHolders`: snapshot-based if a
     *         snapshot exists, otherwise the live ERC1410 holder count.
     * @param couponID  One-based sequential coupon ID to query.
     * @return total_   Number of eligible holders; `0` if the record date has not passed.
     */
    function getTotalCouponHolders(uint256 couponID) internal view returns (uint256 total_) {
        (ICouponTypes.RegisteredCoupon memory registeredCoupon, , ) = getCoupon(couponID);
        if (registeredCoupon.coupon.recordDate >= TimeTravelStorageWrapper.getBlockTimestamp()) return 0;
        if (registeredCoupon.snapshotId != 0)
            return SnapshotsStorageWrapper.totalTokenHoldersAt(registeredCoupon.snapshotId);
        return ERC1410StorageWrapper.getTotalTokenHolders();
    }

    /**
     * @notice Returns the coupon ID at a specific position within the time-adjusted
     *         ordered coupon list.
     * @dev    Returns `0` if `pos` is out of bounds relative to the total adjusted list
     *         length at the current block timestamp.
     *
     *         Position resolution traverses three sources in order:
     *           1. Deprecated legacy entries from `BondStorageWrapper` (indices `[0,
     *              deprecatedTotal)`).
     *           2. Active entries in `CouponDataStorage.couponsOrderedListByIds` (indices
     *              `[deprecatedTotal, actualOrderedListLengthTotal)`).
     *           3. Pending scheduled coupon listings, read in reverse registration order
     *              (indices `[actualOrderedListLengthTotal, adjustedTotal)`).
     *         Gas cost for positions in the pending range scales with the number of pending
     *         listings.
     * @param pos  Zero-based position within the time-adjusted ordered list.
     * @return couponID_  Coupon ID at the requested position; `0` if out of bounds.
     */
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

    /**
     * @notice Returns a paginated slice of coupon IDs from the time-adjusted ordered list.
     * @dev    Computes page bounds via `Pagination.getStartAndEnd`, clamps the result
     *         length against the adjusted total at the current block timestamp, then
     *         resolves each entry via `getCouponFromOrderedListAt`. Gas cost scales
     *         linearly with `pageLength` and may be amplified for entries resolved from
     *         the pending scheduled listing range.
     * @param pageIndex   Zero-based page number to retrieve.
     * @param pageLength  Maximum number of coupon IDs to return per page.
     * @return couponIDs_  Array of coupon IDs for the requested page.
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
     * @notice Returns the total number of entries in the ordered coupon list as visible at
     *         a given timestamp, including pending scheduled coupon listings.
     * @dev    Sums the result of `getCouponsOrderedListTotal` (settled entries) and
     *         `ScheduledTasksStorageWrapper.getPendingScheduledCouponListingTotalAt`
     *         (timestamp-gated pending entries). Pending entries that have not yet reached
     *         `timestamp` are excluded by the scheduled tasks layer.
     * @param timestamp  Unix timestamp used to determine which pending listings are visible.
     * @return total_    Combined count of settled and visible pending coupon list entries.
     */
    function getCouponsOrderedListTotalAdjustedAt(uint256 timestamp) internal view returns (uint256 total_) {
        return
            getCouponsOrderedListTotal() +
            ScheduledTasksStorageWrapper.getPendingScheduledCouponListingTotalAt(timestamp);
    }

    /**
     * @notice Returns the total number of settled entries across both the active and
     *         deprecated portions of the ordered coupon list.
     * @dev    Combines the length of `CouponDataStorage.couponsOrderedListByIds` with the
     *         deprecated legacy count from `BondStorageWrapper`. Does not include pending
     *         scheduled listings; use `getCouponsOrderedListTotalAdjustedAt` for the
     *         full time-adjusted count.
     * @return total_  Total number of settled entries in the ordered coupon list.
     */
    function getCouponsOrderedListTotal() internal view returns (uint256 total_) {
        total_ =
            _couponStorage().couponsOrderedListByIds.length +
            BondStorageWrapper.DEPRECATED_getCouponsOrderedListTotal();
    }

    /**
     * @notice Returns the coupon ID immediately preceding the specified coupon in the
     *         time-adjusted ordered list.
     * @dev    Returns `0` if the list contains fewer than two entries, or if `couponID`
     *         occupies the first position. Iterates linearly from index `0` until a match
     *         is found; gas cost is O(n) in the worst case relative to list length. Callers
     *         should be aware of this for large lists. Uses the current block timestamp to
     *         determine the adjusted list length.
     * @param couponID  Coupon ID whose predecessor is requested.
     * @return previousCouponID_  ID of the preceding coupon; `0` if none exists.
     */
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
     * @notice Computes the fractional coupon payment owed to a token holder as an
     *         unsimplified numerator/denominator pair.
     * @dev    Returns a zero-value struct without performing any arithmetic if
     *         `recordDateReached` is `false`. The coupon amount formula is:
     *
     *           numerator   = tokenBalance × nominalValue × rate × period
     *           denominator = 10^(decimals + nominalValueDecimals + rateDecimals) × 365 days
     *
     *         where `period = coupon.endDate - coupon.startDate` in seconds.
     *         The result is intentionally left as a fraction to preserve precision; callers
     *         are responsible for performing the final division. Overflow is possible for
     *         very large balances or rates; callers should validate inputs appropriately.
     *         Nominal value and its decimals are sourced from `NominalValueStorageWrapper`.
     * @param coupon            Coupon parameters providing rate, decimals, and period dates.
     * @param tokenBalance      Token balance of the holder at the record date snapshot.
     * @param decimals          Token decimal precision at the record date.
     * @param recordDateReached True if the coupon's record date has passed.
     * @return couponAmountFor_  Struct containing the numerator, denominator, and record
     *                           date flag; all zero if `recordDateReached` is `false`.
     */
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

    /**
     * @notice Returns the Diamond Storage pointer for `CouponDataStorage`.
     * @dev    Uses inline assembly to position the struct at the deterministic slot defined
     *         by `_COUPON_STORAGE_POSITION`, following the ERC-2535 Diamond Storage Pattern.
     *         Slot isolation prevents storage collisions with other facet structs in the
     *         same proxy. Must only be called from within this library.
     * @return cs_  Storage pointer to the `CouponDataStorage` struct.
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
