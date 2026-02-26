// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { KpisDataStorage, kpisDataStorage } from "../../storage/ScheduledStorageAccessor.sol";
import { LibCheckpoints } from "../../infrastructure/lib/LibCheckpoints.sol";

/// @title LibKpis
/// @notice Library for managing KPI (Key Performance Indicator) data with checkpoint-based storage
/// @dev Provides sorted insertion of KPI data with date-based checkpoint tracking
library LibKpis {
    using LibCheckpoints for LibCheckpoints.Checkpoint[];

    // ═══════════════════════════════════════════════════════════════════════════════
    // KPI DATA INSERTION
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Add KPI data at a specific date with automatic sorted insertion
    /// @dev Maintains sorted order of checkpoint dates using insertion algorithm.
    ///      If this is the first entry or date is after the last checkpoint,
    ///      simply appends. Otherwise, inserts in correct position by:
    ///      1. Pushing the last checkpoint to the end
    ///      2. Shifting all greater dates one position right
    ///      3. Inserting the new date at the correct position
    /// @param _date The timestamp for the KPI data (must be > minDate and <= block.timestamp)
    /// @param _value The KPI value to store
    /// @param _project The project address associated with this KPI
    function addKpiData(uint256 _date, uint256 _value, address _project) internal {
        KpisDataStorage storage kpis = kpisDataStorage();

        // Mark this date as having a checkpoint
        kpis.checkpointsDatesByProject[_project][_date] = true;

        LibCheckpoints.Checkpoint[] storage ckpt = kpis.checkpointsByProject[_project];
        uint256 length = ckpt.length;

        // Case 1: First entry or date is after the last checkpoint - just append
        if (length == 0 || ckpt[length - 1].from < _date) {
            pushKpiData(ckpt, _date, _value);
            return;
        }

        // Case 2: Date is before the last checkpoint - need to insert in sorted order
        // First, push the last checkpoint to extend the array
        pushKpiData(ckpt, ckpt[length - 1].from, ckpt[length - 1].value);

        // Shift all checkpoints >= _date one position right, starting from the end
        for (uint256 index = length - 1; index >= 0; index--) {
            if (index == 0) {
                // Reached the beginning - insert at position 0
                overwriteKpiData(ckpt, _date, _value, index);
                break;
            }

            if (ckpt[index - 1].from < _date) {
                // Found insertion point - insert at current index
                overwriteKpiData(ckpt, _date, _value, index);
                break;
            }

            // Shift this checkpoint one position right
            overwriteKpiData(ckpt, ckpt[index - 1].from, ckpt[index - 1].value, index);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // CHECKPOINT ARRAY OPERATIONS
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Push a checkpoint onto the array
    /// @param _ckpt The checkpoint array to append to
    /// @param _date The checkpoint date (from field)
    /// @param _value The checkpoint value
    function pushKpiData(LibCheckpoints.Checkpoint[] storage _ckpt, uint256 _date, uint256 _value) internal {
        _ckpt.push(LibCheckpoints.Checkpoint({ from: _date, value: _value }));
    }

    /// @notice Overwrite a checkpoint at a specific position
    /// @param _ckpt The checkpoint array
    /// @param _date The new checkpoint date (from field)
    /// @param _value The new checkpoint value
    /// @param _pos The position to overwrite
    function overwriteKpiData(
        LibCheckpoints.Checkpoint[] storage _ckpt,
        uint256 _date,
        uint256 _value,
        uint256 _pos
    ) internal {
        _ckpt[_pos].from = _date;
        _ckpt[_pos].value = _value;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // MINIMUM DATE MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Set the minimum valid date for KPI data
    /// @param _date The new minimum date threshold
    function setMinDate(uint256 _date) internal {
        kpisDataStorage().minDate = _date;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // CHECKPOINT DATE TRACKING
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Mark a date as having checkpoint data for a project
    /// @param _date The date to mark
    /// @param _project The project address
    function setCheckpointDate(uint256 _date, address _project) internal {
        kpisDataStorage().checkpointsDatesByProject[_project][_date] = true;
    }

    /// @notice Get the current minimum date
    /// @return The minimum date threshold
    function getMinDate() internal view returns (uint256) {
        return kpisDataStorage().minDate;
    }

    /// @notice Check if a date has checkpoint data for a project
    /// @param _date The date to check
    /// @param _project The project address
    /// @return True if the date has a checkpoint, false otherwise
    function isCheckpointDate(uint256 _date, address _project) internal view returns (bool) {
        return kpisDataStorage().checkpointsDatesByProject[_project][_date];
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // KPI DATA LOOKUP
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Get the latest KPI data for a project within a date range
    /// @dev Uses binary search checkpoint lookup to find the most recent KPI value
    ///      at or before the _to timestamp. Returns the value only if it's after _from.
    /// @param _from The start of the date range (exclusive)
    /// @param _to The end of the date range (inclusive)
    /// @param _project The project address
    /// @return value_ The KPI value (0 if not exists)
    /// @return exists_ True if a valid KPI was found within the range
    function getLatestKpiData(
        uint256 _from,
        uint256 _to,
        address _project
    ) internal view returns (uint256 value_, bool exists_) {
        KpisDataStorage storage kpis = kpisDataStorage();
        (uint256 from, uint256 value) = kpis.checkpointsByProject[_project].checkpointsLookup(_to);

        // Checkpoint is valid only if it's after the _from boundary
        if (from <= _from) return (0, false);

        return (value, true);
    }
}
