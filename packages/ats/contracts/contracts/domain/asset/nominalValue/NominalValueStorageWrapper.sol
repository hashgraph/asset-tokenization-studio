// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { SnapshotsStorageWrapper } from "../SnapshotsStorageWrapper.sol";
import { ScheduledTasksOps } from "../../orchestrator/ScheduledTasksOps.sol";

/// @custom:hash storage NominalValue
bytes32 constant STORAGE_LOCATION_NOMINAL_VALUE = 0xf4ae98634996e72bf90c5471fce11baa245e9198f5fa7cdab6e4d46dfe7bfe00;

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
    struct NominalValueDataStorage {
        uint256 nominalValue;
        uint8 nominalValueDecimals;
        bool initialized;
        bytes3 nominalValueCurrency;
    }

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
        _nominalValueStorage().initialized = true;
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

    function getNominalValue() internal view returns (uint256) {
        return _nominalValueStorage().nominalValue;
    }

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

    function isNominalValueInitialized() internal view returns (bool) {
        return _nominalValueStorage().initialized;
    }

    function _nominalValueStorage() private pure returns (NominalValueDataStorage storage nvData_) {
        bytes32 position = STORAGE_LOCATION_NOMINAL_VALUE;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            nvData_.slot := position
        }
    }
}
