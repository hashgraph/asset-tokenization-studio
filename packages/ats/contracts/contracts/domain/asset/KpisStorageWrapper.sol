// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { KPI_KPIS_ADD_COUPON_DATE, KPI_KPIS_SET_MINDATE } from "../../constants/values.sol";
import { IKpis } from "../../facets/kpi/IKpis.sol";
import { Checkpoints } from "../../infrastructure/utils/Checkpoints.sol";
import { CouponStorageWrapper } from "./coupon/CouponStorageWrapper.sol";
import { ICouponTypes } from "../../facets/coupon/ICouponTypes.sol";
import { _checkUnexpectedError } from "../../infrastructure/utils/UnexpectedError.sol";

import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
/// @custom:hash storage Kpis
bytes32 constant STORAGE_LOCATION_KPIS = 0x0016dc918f7b373bc12e22119ae85cf4b20c396d9179f6ed9b5f01993586a000;

/**
 * @title KpisDataStorage
 * @notice Backing storage for KPI checkpoints keyed by project address.
 * @dev Maintains a sorted `Checkpoint[]` per project plus a presence set of recorded
 *      dates to enforce uniqueness in O(1). `minDate` advances forward as coupons
 *      anchor their fixing dates.
 * @param minDate Lower bound below which new KPI data points are rejected.
 * @param checkpointsByProject Per-project sorted KPI checkpoint arrays.
 * @param checkpointsDatesByProject Per-project membership set of recorded checkpoint dates.
 * @custom:storage-location erc7201:security.token.standard.storage.Kpis
 */
struct KpisDataStorage {
    // ─── R1 Lifecycle (bool flags) ───────────────────────────
    // ─── R2 Packed scalars (uint8, bytes3, address, enum) ────
    // ─── R3 Single-slot scalars (uint256, bytes32, string) ───
    uint256 minDate;
    // ─── R4 Aggregates (mapping, array, EnumerableSet) ───────
    mapping(address => Checkpoints.Checkpoint[]) checkpointsByProject;
    mapping(address => mapping(uint256 => bool)) checkpointsDatesByProject;
    // ─── APPEND-ONLY ZONE BELOW ───
}

/**
 * @title KpisStorageWrapper
 * @notice Library managing KPI checkpoints, project membership, and minimum-date tracking.
 * @dev All functions are internal. KPI insertions keep the per-project array sorted by
 *      `from`; lookups use `Checkpoints.checkpointsLookup`.
 * @author Asset Tokenization Studio Team
 */
library KpisStorageWrapper {
    using Checkpoints for Checkpoints.Checkpoint[];

    /**
     * @notice Inserts a KPI data point at `date` for `project`, maintaining sort order.
     * @dev Reverts if the date is already a checkpoint for the project. Appends in O(1)
     *      when the date is strictly greater than the latest entry; otherwise shifts the
     *      tail right to place the new entry in its sorted position. Emits `KpiDataAdded`.
     * @param date The KPI data timestamp (must be unique per project).
     * @param value The KPI data value.
     * @param project The project address the KPI belongs to.
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
     * @notice Registers a coupon in the ordered list and advances `minDate` accordingly.
     * @dev Delegates list maintenance to `CouponStorageWrapper`; asserts the coupon's
     *      fixing date does not regress below the current `minDate`.
     * @param couponID Identifier of the coupon being registered.
     */
    function addToCouponsOrderedList(uint256 couponID) internal {
        CouponStorageWrapper.addToCouponsOrderedList(couponID);

        (ICouponTypes.RegisteredCoupon memory registeredCoupon, , ) = CouponStorageWrapper.getCoupon(couponID);
        uint256 lastFixingDate = registeredCoupon.coupon.fixingDate;

        _checkUnexpectedError(lastFixingDate < kpisDataStorage().minDate, KPI_KPIS_ADD_COUPON_DATE);

        setMinDate(lastFixingDate);
    }

    /**
     * @notice Appends a checkpoint entry at the end of the given storage array.
     * @param ckpt The storage array to push into.
     * @param date The checkpoint's `from` timestamp.
     * @param value The checkpoint value.
     */
    function pushKpiData(Checkpoints.Checkpoint[] storage ckpt, uint256 date, uint256 value) internal {
        ckpt.push(Checkpoints.Checkpoint({ from: date, value: value }));
    }

    /**
     * @notice Overwrites the checkpoint at `pos` with new date and value.
     * @param ckpt The storage array to mutate.
     * @param date New `from` timestamp.
     * @param value New checkpoint value.
     * @param pos Index of the entry to overwrite.
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
     * @notice Updates the minimum allowed KPI date.
     * @param date The new minimum date.
     */
    function setMinDate(uint256 date) internal {
        kpisDataStorage().minDate = date;
    }

    /**
     * @notice Marks `(project, date)` as an existing KPI checkpoint.
     * @param date The date being recorded.
     * @param project The project the checkpoint belongs to.
     */
    function setCheckpointDate(uint256 date, address project) internal {
        kpisDataStorage().checkpointsDatesByProject[project][date] = true;
    }

    /**
     * @notice Validates a candidate KPI date for a project.
     * @dev Rejects dates ≤ `getMinDateAdjusted()`, dates strictly greater than the
     *      current block timestamp, and dates already recorded for the project.
     * @param date Candidate date to validate.
     * @param project Project the KPI is associated with.
     */
    function requireValidDate(uint256 date, address project) internal view {
        uint256 minDate = getMinDateAdjusted();
        if (date <= minDate || date > EvmAccessors.getBlockTimestamp()) {
            revert IKpis.InvalidDate(date, minDate, EvmAccessors.getBlockTimestamp());
        }
        if (isCheckpointDate(date, project)) {
            revert IKpis.KpiDataAlreadyExists(date);
        }
    }

    /**
     * @notice Returns the latest KPI value for `project` within the `(from, to]` window.
     * @dev Uses `checkpointsLookup` to find the most recent checkpoint at or before `to`;
     *      returns `(0, false)` when the located checkpoint precedes or equals `from`.
     * @param from Exclusive lower bound for the window.
     * @param to Upper bound used for the checkpoint lookup.
     * @param project Project whose checkpoints are queried.
     * @return value The latest checkpoint value within the window.
     * @return found True when a qualifying checkpoint was located, false otherwise.
     */
    function getLatestKpiData(uint256 from, uint256 to, address project) internal view returns (uint256, bool) {
        (uint256 checkpointFrom, uint256 value_) = kpisDataStorage().checkpointsByProject[project].checkpointsLookup(
            to
        );
        if (checkpointFrom <= from) return (0, false);
        return (value_, true);
    }

    /**
     * @notice Returns the current minimum KPI date, advanced by the latest coupon's fixing date.
     * @dev When at least one coupon exists, `minDate_` is overridden by the fixing date of the
     *      most recent coupon at the current block timestamp; the result must never regress.
     * @return minDate_ The adjusted minimum date below which new KPI entries are rejected.
     */
    function getMinDateAdjusted() internal view returns (uint256 minDate_) {
        minDate_ = kpisDataStorage().minDate;

        uint256 total = CouponStorageWrapper.getCouponsOrderedListTotalAdjustedAt(
            EvmAccessors.getBlockTimestamp(),
            true
        );

        if (total == 0) return minDate_;

        ICouponTypes.Coupon memory rawCoupon;

        (rawCoupon, , ) = CouponStorageWrapper.getRawCouponData(
            CouponStorageWrapper.getCouponFromOrderedListAt(total - 1, true)
        );
        uint256 lastFixingDate = rawCoupon.fixingDate;

        _checkUnexpectedError(lastFixingDate < minDate_, KPI_KPIS_SET_MINDATE);

        minDate_ = lastFixingDate;
    }

    /**
     * @notice Reports whether `date` is already recorded as a KPI checkpoint for `project`.
     * @param date Date to query.
     * @param project Project to query.
     * @return True when the date is a recorded checkpoint for the project.
     */
    function isCheckpointDate(uint256 date, address project) internal view returns (bool) {
        return kpisDataStorage().checkpointsDatesByProject[project][date];
    }

    /**
     * @notice Returns the storage pointer for KPI data at the deterministic slot.
     * @dev Uses inline assembly to load the ERC-7201 slot from a precomputed constant.
     * @return kpisDataStorage_ Storage pointer to `KpisDataStorage`.
     */
    function kpisDataStorage() private pure returns (KpisDataStorage storage kpisDataStorage_) {
        bytes32 position = STORAGE_LOCATION_KPIS;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            kpisDataStorage_.slot := position
        }
    }
}
