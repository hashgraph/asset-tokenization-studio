// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { SnapshotsStorageWrapper } from "./SnapshotsStorageWrapper.sol";
import { ScheduledTasksOps } from "../orchestrator/ScheduledTasksOps.sol";

/// @custom:hash storage NominalValue
bytes32 constant STORAGE_LOCATION_NOMINAL_VALUE = 0xf4ae98634996e72bf90c5471fce11baa245e9198f5fa7cdab6e4d46dfe7bfe00;

/**
 * @title NominalValueDataStorage
 * @notice Backing storage for nominal value, decimals, ISO 4217 currency code, effective
 *         datetime, and the unit/total nominal value flag.
 * @dev Sole source of truth for nominal-value fields on this asset; mutated only via
 *      `NominalValueStorageWrapper` against the deterministic ERC-7201 slot.
 * @param nominalValueDecimals Number of decimals applied to `nominalValue`. Fixed at
 *        initialization; never changed by `publishNominalValue`/`republishNominalValue`.
 * @param nominalValueCurrency ISO 4217 currency code, or `0x000000` when unset.
 * @param isUnitNominalValue Whether `nominalValue` expresses a per-unit (true) or aggregate
 *        (false) value. Fixed at initialization.
 * @param nominalValue Nominal amount expressed with `nominalValueDecimals` precision.
 * @param effectiveDatetime Timestamp (Unix epoch, seconds) as of which `nominalValue` is
 *        effective. Advances strictly forward on each `publishNominalValue` call; unchanged by
 *        `republishNominalValue`.
 * @custom:storage-location erc7201:security.token.standard.storage.NominalValue
 */
struct NominalValueDataStorage {
    // ─── R3 Single-slot scalars (uint256) ────────────────────
    uint256 nominalValueDecimals;
    // ─── R2 Packed scalars (bytes3, bool) ────────────────────
    bytes3 nominalValueCurrency;
    bool isUnitNominalValue;
    // ─── R3 Single-slot scalars (uint256) ────────────────────
    uint256 nominalValue;
    uint256 effectiveDatetime;
}

/**
 * @title NominalValueStorageWrapper - Nominal Value Storage Wrapper
 * @notice Storage wrapper for nominal value data on a security token.
 * @dev Reads and writes the dedicated storage slot defined by
 *      `STORAGE_LOCATION_NOMINAL_VALUE`.
 * @author Asset Tokenization Studio Team
 */
library NominalValueStorageWrapper {
    /**
     * @notice Initialises the dedicated nominal value storage with amount, decimals, currency,
     *         effective datetime, and the unit/total flag.
     * @param _nominalValue Initial nominal value amount.
     * @param _nominalValueDecimals Number of decimals applied to `_nominalValue`.
     * @param _nominalValueCurrency ISO 4217 currency code as `bytes3`.
     * @param _effectiveDatetime Timestamp as of which `_nominalValue` is effective.
     * @param _isUnitNominalValue Whether `_nominalValue` is a per-unit (true) or aggregate
     *        (false) value.
     */
    function initializeNominalValue(
        uint256 _nominalValue,
        uint256 _nominalValueDecimals,
        bytes3 _nominalValueCurrency,
        uint256 _effectiveDatetime,
        bool _isUnitNominalValue
    ) internal {
        SnapshotsStorageWrapper.updateNominalValueDecimalsSnapshot();

        NominalValueDataStorage storage nvData_ = _nominalValueStorage();
        nvData_.nominalValueDecimals = _nominalValueDecimals;
        nvData_.nominalValueCurrency = _nominalValueCurrency;
        nvData_.isUnitNominalValue = _isUnitNominalValue;

        writeNominalValue(_nominalValue, _effectiveDatetime);
    }

    /**
     * @param _nominalValue New nominal value amount.
     * @param _effectiveDatetime New effective datetime to store.
     */
    function writeNominalValue(uint256 _nominalValue, uint256 _effectiveDatetime) internal {
        ScheduledTasksOps.triggerPendingScheduledCrossOrderedTasks();

        SnapshotsStorageWrapper.updateNominalValueSnapshot();

        NominalValueDataStorage storage nvData_ = _nominalValueStorage();
        nvData_.nominalValue = _nominalValue;
        nvData_.effectiveDatetime = _effectiveDatetime;
    }

    /**
     * @notice Reads the nominal value amount from the dedicated storage slot.
     * @return The nominal value amount expressed with `getNominalValueDecimals()` precision.
     */
    function getNominalValue() internal view returns (uint256) {
        return _nominalValueStorage().nominalValue;
    }

    /**
     * @notice Reads the nominal value decimals from the dedicated storage slot.
     * @return The number of decimals applied to the nominal value amount.
     */
    function getNominalValueDecimals() internal view returns (uint256) {
        return _nominalValueStorage().nominalValueDecimals;
    }

    /**
     * @notice Reads the ISO 4217 currency code from the dedicated storage slot.
     * @return The ISO 4217 currency code as `bytes3`; `0x000000` when unset.
     */
    function getNominalValueCurrency() internal view returns (bytes3) {
        return _nominalValueStorage().nominalValueCurrency;
    }

    /**
     * @notice Reads whether the nominal value is a per-unit or aggregate value.
     * @return True when the nominal value is expressed per unit; false when aggregate.
     */
    function getIsUnitNominalValue() internal view returns (bool) {
        return _nominalValueStorage().isUnitNominalValue;
    }

    /**
     * @notice Reads the currently stored effective datetime from the dedicated storage slot.
     * @return The currently stored effective datetime.
     */
    function getEffectiveDatetime() internal view returns (uint256) {
        return _nominalValueStorage().effectiveDatetime;
    }

    /**
     * @notice Returns the storage pointer for nominal value data at the deterministic slot.
     * @dev Uses inline assembly to load the ERC-7201 slot from a precomputed constant.
     * @return nvData_ Storage pointer to `NominalValueDataStorage`.
     */
    function _nominalValueStorage() private pure returns (NominalValueDataStorage storage nvData_) {
        bytes32 position = STORAGE_LOCATION_NOMINAL_VALUE;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            nvData_.slot := position
        }
    }
}
