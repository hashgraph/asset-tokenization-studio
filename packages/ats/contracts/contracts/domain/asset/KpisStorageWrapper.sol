// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _KPIS_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { KPI_KPIS_ADD_COUPON_DATE, KPI_KPIS_SET_MINDATE } from "../../constants/values.sol";
import { IKpis } from "../../facets/layer_2/kpi/kpiLatest/IKpis.sol";
import { Checkpoints } from "../../infrastructure/utils/Checkpoints.sol";
import { CouponStorageWrapper } from "./coupon/CouponStorageWrapper.sol";
import { ICouponTypes } from "../../facets/layer_2/coupon/ICouponTypes.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { _checkUnexpectedError } from "../../infrastructure/utils/UnexpectedError.sol";

/**
 * @notice Diamond Storage struct for KPI checkpoint data management.
 * @dev    Stored at `_KPIS_STORAGE_POSITION`. `checkpointsByProject` holds a sorted
 *         array of date-value checkpoints per project; insertion order is maintained by
 *         `addKpiData`. `checkpointsDatesByProject` prevents duplicate date entries per
 *         project. `minDate` tracks the latest coupon fixing date registered via
 *         `addToCouponsOrderedList` and is used as the lower bound for valid KPI data
 *         submission dates.
 * @param checkpointsByProject      Maps a project address to its chronologically ordered
 *                                  array of KPI data checkpoints.
 * @param checkpointsDatesByProject Maps (project, date) to a boolean indicating whether
 *                                  a checkpoint has already been recorded for that date.
 * @param minDate                   Lower bound timestamp for valid KPI data submissions;
 *                                  updated to the latest coupon fixing date on coupon
 *                                  registration.
 */
struct KpisDataStorage {
    mapping(address => Checkpoints.Checkpoint[]) checkpointsByProject;
    mapping(address => mapping(uint256 => bool)) checkpointsDatesByProject;
    uint256 minDate;
}

/**
 * @title  KpisStorageWrapper
 * @notice Internal library for managing KPI data checkpoint storage, including sorted
 *         insertion of time-series KPI values per project and coupling with the coupon
 *         ordered list for minimum date enforcement.
 * @dev    Anchors `KpisDataStorage` at `_KPIS_STORAGE_POSITION` following the ERC-2535
 *         Diamond Storage Pattern. All functions are `internal` and intended exclusively
 *         for use within facets or other internal libraries of the same diamond.
 *
 *         KPI data is stored as a sorted array of `Checkpoints.Checkpoint` structs per
 *         project, ordered ascending by `from` (date). Two insertion paths exist in
 *         `addKpiData`: O(1) append when the new date is greater than the current
 *         latest, and O(n) shift-right insertion for out-of-order entries. Callers
 *         should prefer in-order submission to minimise gas consumption.
 *
 *         `minDate` is derived from the coupon ordered list and enforces that KPI data
 *         can only be submitted for dates after the latest registered coupon fixing date.
 *         `getMinDateAdjusted` recomputes this dynamically from the current coupon list
 *         state at read time; `minDate` in storage serves as a cached lower bound that
 *         is monotonically increasing.
 *
 *         Block timestamps are sourced from `TimeTravelStorageWrapper` to support
 *         test-environment time manipulation without affecting production logic.
 * @author Hashgraph
 */
library KpisStorageWrapper {
    using Checkpoints for Checkpoints.Checkpoint[];

    /**
     * @notice Inserts a KPI data point for a project at the specified date, maintaining
     *         ascending date order in the checkpoint array.
     * @dev    Reverts with `IKpis.KpiDataAlreadyExists` if a checkpoint for `date`
     *         already exists for `project`. Marks the date as registered before
     *         insertion to prevent re-entrance. If the array is empty or `date` exceeds
     *         the current latest checkpoint date, appends in O(1). Otherwise performs an
     *         O(n) in-place right-shift insertion to maintain sorted order. Uses
     *         `unchecked` arithmetic for index arithmetic within the shift loop.
     *         Emits: `IKpis.KpiDataAdded`.
     * @param date     Unix timestamp of the KPI measurement.
     * @param value    KPI metric value at `date`.
     * @param project  Project address to which this KPI data point belongs.
     */
    function addKpiData(uint256 date, uint256 value, address project) internal {
        if (isCheckpointDate(date, project)) revert IKpis.KpiDataAlreadyExists(date);
        setCheckpointDate(date, project);
        Checkpoints.Checkpoint[] storage ckpt = kpisDataStorage().checkpointsByProject[project];
        uint256 length = ckpt.length;
        uint256 latest;
        unchecked {
            latest = length - 1;
        }
        // Fast path: append to end
        if (length == 0 || ckpt[latest].from < date) {
            ckpt.push(Checkpoints.Checkpoint({ from: date, value: value }));
            emit IKpis.KpiDataAdded(project, date, value);
            return;
        }
        // Insert in sorted position: extend array, shift right, write new element
        ckpt.push(Checkpoints.Checkpoint({ from: ckpt[latest].from, value: ckpt[latest].value }));
        unchecked {
            for (uint256 i = length; i > 0; --i) {
                uint256 prev = i - 1;
                if (ckpt[prev].from <= date) {
                    ckpt[i] = Checkpoints.Checkpoint({ from: date, value: value });
                    emit IKpis.KpiDataAdded(project, date, value);
                    return;
                }
                ckpt[i] = ckpt[prev];
            }
        }
        // Insert at position 0
        ckpt[0] = Checkpoints.Checkpoint({ from: date, value: value });
        emit IKpis.KpiDataAdded(project, date, value);
    }

    /**
     * @notice Registers a coupon in the ordered list and updates `minDate` to the
     *         coupon's fixing date if it is later than the current stored value.
     * @dev    Delegates list registration to `CouponStorageWrapper.addToCouponsOrderedList`
     *         then reads back the coupon's `fixingDate`. Triggers
     *         `_checkUnexpectedError` with `KPI_KPIS_ADD_COUPON_DATE` if the fixing date
     *         is less than the current `minDate`, indicating an unexpected ordering
     *         violation. `minDate` must be monotonically non-decreasing; callers must
     *         ensure coupons are registered in non-decreasing fixing date order.
     * @param couponID  One-based sequential coupon ID to append to the ordered list.
     */
    function addToCouponsOrderedList(uint256 couponID) internal {
        CouponStorageWrapper.addToCouponsOrderedList(couponID);
        (ICouponTypes.RegisteredCoupon memory registeredCoupon, , ) = CouponStorageWrapper.getCoupon(couponID);
        uint256 lastFixingDate = registeredCoupon.coupon.fixingDate;
        _checkUnexpectedError(lastFixingDate < kpisDataStorage().minDate, KPI_KPIS_ADD_COUPON_DATE);
        setMinDate(lastFixingDate);
    }

    /**
     * @notice Appends a new checkpoint to the provided checkpoint array without
     *         performing any date or duplication validation.
     * @dev    Intended for use in migration or batch-load scenarios where the caller
     *         guarantees correct ordering and uniqueness. Emits no event.
     * @param ckpt   Storage reference to the project's checkpoint array.
     * @param date   Unix timestamp of the checkpoint to append.
     * @param value  KPI metric value to append.
     */
    function pushKpiData(Checkpoints.Checkpoint[] storage ckpt, uint256 date, uint256 value) internal {
        ckpt.push(Checkpoints.Checkpoint({ from: date, value: value }));
    }

    /**
     * @notice Overwrites an existing checkpoint at the specified array position with new
     *         date and value fields.
     * @dev    Intended for use in migration or correction scenarios. No bounds checking
     *         is performed; callers must ensure `pos` is within the current array length.
     *         Overwriting a date without updating `checkpointsDatesByProject` will leave
     *         the old date registered as a valid checkpoint date.
     * @param ckpt   Storage reference to the project's checkpoint array.
     * @param date   New Unix timestamp to write at `pos`.
     * @param value  New KPI metric value to write at `pos`.
     * @param pos    Zero-based index within the checkpoint array to overwrite.
     */
    function overwriteKpiData(
        Checkpoints.Checkpoint[] storage ckpt,
        uint256 date,
        uint256 value,
        uint256 pos
    ) internal {
        ckpt[pos].from = date;
        ckpt[pos].value = value;
    }

    /**
     * @notice Directly overwrites the stored `minDate` value.
     * @dev    Does not enforce monotonicity; callers must ensure `date` is not less than
     *         the current `minDate` to preserve the invariant that `minDate` only
     *         increases. Used by `addToCouponsOrderedList` to advance the lower bound
     *         after coupon registration.
     * @param date  New minimum date lower bound to store.
     */
    function setMinDate(uint256 date) internal {
        kpisDataStorage().minDate = date;
    }

    /**
     * @notice Records that a KPI checkpoint exists for the given project at the given
     *         date, enabling O(1) duplicate detection in subsequent submissions.
     * @dev    Sets `checkpointsDatesByProject[project][date]` to `true`. This flag is
     *         never cleared; a date once registered for a project is permanently marked.
     * @param date     Unix timestamp to register as a known checkpoint date.
     * @param project  Project address for which the date is being registered.
     */
    function setCheckpointDate(uint256 date, address project) internal {
        kpisDataStorage().checkpointsDatesByProject[project][date] = true;
    }

    /**
     * @notice Reverts if `date` is not a valid submission date for KPI data for the
     *         given project.
     * @dev    Validity requires all of the following:
     *           1. `date > getMinDateAdjusted()` — the date must strictly exceed the
     *              lower bound derived from the latest coupon fixing date.
     *           2. `date <= block.timestamp` — the date must not be in the future.
     *           3. No existing checkpoint for `date` and `project`.
     *         Reverts with `IKpis.InvalidDate` if conditions 1 or 2 fail, or with
     *         `IKpis.KpiDataAlreadyExists` if condition 3 fails.
     *         `getMinDateAdjusted` reads from `CouponStorageWrapper` and triggers
     *         `_checkUnexpectedError` if coupon ordering is inconsistent.
     * @param date     Unix timestamp proposed for a new KPI data submission.
     * @param project  Project address for which the date is being validated.
     */
    function requireValidDate(uint256 date, address project) internal view {
        uint256 minDate = getMinDateAdjusted();
        if (date <= minDate || date > TimeTravelStorageWrapper.getBlockTimestamp()) {
            revert IKpis.InvalidDate(date, minDate, TimeTravelStorageWrapper.getBlockTimestamp());
        }
        if (isCheckpointDate(date, project)) {
            revert IKpis.KpiDataAlreadyExists(date);
        }
    }

    /**
     * @notice Returns the most recent KPI checkpoint value for a project within the
     *         interval `(from, to]`, and a flag indicating whether a qualifying
     *         checkpoint was found.
     * @dev    Delegates to `Checkpoints.checkpointsLookup` to find the latest checkpoint
     *         with `from <= to`. Returns `(0, false)` if the found checkpoint's `from`
     *         value is not strictly greater than `from`, indicating no new data exists
     *         in the requested interval. Callers should treat a `false` return as
     *         meaning no KPI data is available for the period.
     * @param from     Start of the query interval (exclusive).
     * @param to       End of the query interval (inclusive).
     * @param project  Project address whose checkpoint array is queried.
     * @return         KPI value at the latest checkpoint in `(from, to]`; `0` if absent.
     * @return         True if a qualifying checkpoint was found in the interval; false
     *                 otherwise.
     */
    function getLatestKpiData(uint256 from, uint256 to, address project) internal view returns (uint256, bool) {
        (uint256 checkpointFrom, uint256 value_) = kpisDataStorage().checkpointsByProject[project].checkpointsLookup(
            to
        );
        if (checkpointFrom <= from) return (0, false);
        return (value_, true);
    }

    /**
     * @notice Returns the effective minimum date lower bound for KPI data submissions,
     *         computed from the fixing date of the last coupon in the time-adjusted
     *         ordered list.
     * @dev    If the coupon ordered list is empty at the current block timestamp, returns
     *         the stored `minDate` directly. Otherwise reads the last coupon in the
     *         adjusted list and uses its `fixingDate`. Triggers `_checkUnexpectedError`
     *         with `KPI_KPIS_SET_MINDATE` if the last coupon's fixing date is less than
     *         the stored `minDate`, indicating an unexpected ordering inconsistency.
     *         This function is more expensive than reading `minDate` directly due to the
     *         coupon list lookup; callers in tight loops should cache the result.
     * @return minDate_  Effective minimum date lower bound for KPI data submissions.
     */
    function getMinDateAdjusted() internal view returns (uint256 minDate_) {
        minDate_ = kpisDataStorage().minDate;
        uint256 total = CouponStorageWrapper.getCouponsOrderedListTotalAdjustedAt(
            TimeTravelStorageWrapper.getBlockTimestamp()
        );
        if (total == 0) return minDate_;
        (ICouponTypes.RegisteredCoupon memory registeredCoupon, , ) = CouponStorageWrapper.getCoupon(
            CouponStorageWrapper.getCouponFromOrderedListAt(total - 1)
        );
        uint256 lastFixingDate = registeredCoupon.coupon.fixingDate;
        _checkUnexpectedError(lastFixingDate < minDate_, KPI_KPIS_SET_MINDATE);
        minDate_ = lastFixingDate;
    }

    /**
     * @notice Returns whether a KPI checkpoint has already been recorded for the given
     *         project at the given date.
     * @dev    O(1) read from the `checkpointsDatesByProject` mapping. Returns `false`
     *         for any (date, project) pair that has not been explicitly registered.
     * @param date     Unix timestamp to check.
     * @param project  Project address to check against.
     * @return True if a checkpoint exists for `project` at `date`; false otherwise.
     */
    function isCheckpointDate(uint256 date, address project) internal view returns (bool) {
        return kpisDataStorage().checkpointsDatesByProject[project][date];
    }

    /**
     * @notice Returns the Diamond Storage pointer for `KpisDataStorage`.
     * @dev    Uses inline assembly to position the struct at the deterministic slot
     *         defined by `_KPIS_STORAGE_POSITION`, following the ERC-2535 Diamond
     *         Storage Pattern. Slot isolation prevents collisions with other facet
     *         storage structs in the same proxy. Must only be called from within this
     *         library.
     * @return kpisDataStorage_  Storage pointer to the `KpisDataStorage` struct.
     */
    function kpisDataStorage() private pure returns (KpisDataStorage storage kpisDataStorage_) {
        bytes32 position = _KPIS_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            kpisDataStorage_.slot := position
        }
    }
}
