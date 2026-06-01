// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { SnapshotsStorageWrapper } from "./SnapshotsStorageWrapper.sol";
import { ScheduledTasksOps } from "../orchestrator/ScheduledTasksOps.sol";

/// @custom:hash storage NominalValue
bytes32 constant STORAGE_LOCATION_NOMINAL_VALUE = 0xf4ae98634996e72bf90c5471fce11baa245e9198f5fa7cdab6e4d46dfe7bfe00;

/**
 * @title NominalValueDataStorage
 * @notice Backing storage for nominal value, decimals, and ISO 4217 currency code.
 * @dev Sole source of truth for nominal-value fields on this asset; mutated only via
 *      `NominalValueStorageWrapper` against the deterministic ERC-7201 slot.
 * @param nominalValueDecimals Number of decimals applied to `nominalValue`.
 * @param nominalValueCurrency ISO 4217 currency code (`0x000000` when unset).
 * @param nominalValue Nominal value amount expressed with `nominalValueDecimals` precision.
 * @custom:storage-location erc7201:security.token.standard.storage.NominalValue
 */
struct NominalValueDataStorage {
    // ─── R1 Packed scalars (uint8, bytes3, address, enum) ────
    uint8 nominalValueDecimals;
    bytes3 nominalValueCurrency;
    // ─── R2 Single-slot scalars (uint256, bytes32, string) ───
    uint256 nominalValue;
    // ─── R4 Aggregates (mapping, array, EnumerableSet) ───────
    // ─── APPEND-ONLY ZONE BELOW ───
}

/**
 * @title NominalValueStorageWrapper - Nominal Value Storage Wrapper
 * @notice Storage wrapper for nominal value data on a security token.
 * @dev Reads and writes the dedicated storage slot defined by
 *      `STORAGE_LOCATION_NOMINAL_VALUE`. Aggregation of any legacy bond/equity
 *      nominal-value slots has been retired — this slot is now the sole source
 *      of truth for `nominalValue`, `nominalValueDecimals`, and
 *      `nominalValueCurrency`.
 * @author Asset Tokenization Studio Team
 */
library NominalValueStorageWrapper {
    /**
     * @notice Initialises the dedicated nominal value storage with amount, decimals, and currency.
     * @param _nominalValue Initial nominal value amount.
     * @param _nominalValueDecimals Number of decimals applied to `_nominalValue`.
     * @param _nominalValueCurrency ISO 4217 currency code as `bytes3`.
     */
    function initializeNominalValue(
        uint256 _nominalValue,
        uint8 _nominalValueDecimals,
        bytes3 _nominalValueCurrency
    ) internal {
        setNominalValue(_nominalValue, _nominalValueDecimals);
        setNominalValueCurrency(_nominalValueCurrency);
    }

    /**
     * @notice Writes the nominal value amount and decimals to the dedicated storage slot.
     * @param _nominalValue New nominal value amount.
     * @param _nominalValueDecimals New decimals applied to `_nominalValue`.
     */
    function setNominalValue(uint256 _nominalValue, uint8 _nominalValueDecimals) internal {
        ScheduledTasksOps.triggerPendingScheduledCrossOrderedTasks();

        SnapshotsStorageWrapper.updateNominalValueSnapshot();
        SnapshotsStorageWrapper.updateNominalValueDecimalsSnapshot();

        NominalValueDataStorage storage nvData_ = _nominalValueStorage();
        nvData_.nominalValue = _nominalValue;
        nvData_.nominalValueDecimals = _nominalValueDecimals;
    }

    /**
     * @notice Writes the ISO 4217 currency code to the dedicated storage slot.
     * @param _nominalValueCurrency New ISO 4217 currency code as `bytes3`.
     */
    function setNominalValueCurrency(bytes3 _nominalValueCurrency) internal {
        _nominalValueStorage().nominalValueCurrency = _nominalValueCurrency;
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
    function getNominalValueDecimals() internal view returns (uint8) {
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
