// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { BondStorageWrapper } from "../BondStorageWrapper.sol";
import { EquityStorageWrapper } from "../EquityStorageWrapper.sol";
import { _NOMINAL_VALUE_STORAGE_POSITION } from "../../../constants/storagePositions.sol";
import { SnapshotsStorageWrapper } from "../SnapshotsStorageWrapper.sol";
import { ScheduledTasksStorageWrapper } from "../ScheduledTasksStorageWrapper.sol";

/**
 * @title NominalValueStorageWrapper - Nominal Value Storage Wrapper
 * @notice Storage wrapper for nominal value data, aggregating legacy bond and
 *         equity storage for backward compatibility during migration.
 * @dev Reads nominal value from the dedicated storage slot and aggregates it
 *      with legacy bond and equity storage fields. Once all legacy tokens have
 *      been migrated, the legacy reads should be removed and the getters
 *      simplified to return only the dedicated storage values.
 * @author Asset Tokenization Studio Team
 */
library NominalValueStorageWrapper {
    /**
     * @notice Dedicated storage layout for the nominal value capability.
     * @dev `nominalValueCurrency` is appended after `initialized` so the slot layout of tokens
     *      already deployed under the prior 3-field struct stays stable; the new field lives in
     *      a fresh slot and reads `bytes3(0)` for pre-existing tokens until set.
     */
    struct NominalValueDataStorage {
        uint256 nominalValue;
        uint8 nominalValueDecimals;
        bool initialized;
        bytes3 nominalValueCurrency;
    }

    // BondDataStorage layout (at _BOND_STORAGE_POSITION = keccak256("security.token.standard.bond.storage")):
    //   slot+0: bytes3  currency
    //   slot+1: uint256 nominalValue           <-- legacy bond nominalValue
    //   slot+2: uint256 startingDate
    //   slot+3: uint256 maturityDate
    //   slot+4: bool initialized (1 byte) + uint8 nominalValueDecimals (1 byte) — packed
    //             ^-- bool at byte 0, uint8 at byte 1
    //
    // EquityDataStorage layout (at _EQUITY_STORAGE_POSITION = keccak256("security.token.standard.equity.storage")):
    //   slot+0: bool votingRight (1) + bool informationRight (1) + ... + bool putRight (1) — 8 bools packed
    //   slot+1: IEquity.DividendType dividendRight (1 byte) + bytes3 currency (3 bytes, padded)
    //   slot+2: uint256 nominalValue           <-- legacy equity nominalValue
    //   slot+3: bool initialized (1 byte) + uint8 nominalValueDecimals (1 byte) — packed
    //             ^-- bool at byte 0, uint8 at byte 1
    /**
     * @notice Initialises the dedicated nominal value storage with amount, decimals, and currency.
     * @dev Order is load-bearing: `setNominalValue` runs the legacy bond/equity migration BEFORE
     *      `setNominalValueCurrency` writes the dedicated currency slot. This guarantees that the
     *      legacy `bytes3 currency` slot at `BondDataStorage.slot+0` has been left alone by the
     *      migration (which only touches legacy nominalValue fields) and the newly-written
     *      currency lives exclusively in the dedicated `NominalValueDataStorage` layout.
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
     * @dev Runs `_migrateLegacyNominalValue` first so any non-zero legacy bond/equity slots are
     *      cleared before the dedicated write, ensuring the aggregating getters return the new
     *      value alone rather than double-counting legacy data.
     * @param _nominalValue New nominal value amount.
     * @param _nominalValueDecimals New decimals applied to `_nominalValue`.
     */
    function setNominalValue(uint256 _nominalValue, uint8 _nominalValueDecimals) internal {
        _migrateLegacyNominalValue();

        ScheduledTasksStorageWrapper.callTriggerPendingScheduledCrossOrderedTasks();

        SnapshotsStorageWrapper.updateNominalValueSnapshot();
        SnapshotsStorageWrapper.updateNominalValueDecimalsSnapshot();

        NominalValueDataStorage storage nvData_ = _nominalValueStorage();
        nvData_.nominalValue = _nominalValue;
        nvData_.nominalValueDecimals = _nominalValueDecimals;
    }

    /**
     * @notice Writes the ISO 4217 currency code to the dedicated storage slot.
     * @dev No migration is performed: legacy bond/equity `bytes3 currency` fields are NOT
     *      aggregated into `getNominalValueCurrency`, so they cannot collide here.
     * @param _nominalValueCurrency New ISO 4217 currency code as `bytes3`.
     */
    function setNominalValueCurrency(bytes3 _nominalValueCurrency) internal {
        _nominalValueStorage().nominalValueCurrency = _nominalValueCurrency;
    }

    function getNominalValue() internal view returns (uint256) {
        return
            _nominalValueStorage().nominalValue +
            BondStorageWrapper.getDeprecatedNominalValue() +
            EquityStorageWrapper.getDeprecatedNominalValue();
    }

    function getNominalValueDecimals() internal view returns (uint8) {
        return
            _nominalValueStorage().nominalValueDecimals +
            BondStorageWrapper.getDeprecatedNominalValueDecimals() +
            EquityStorageWrapper.getDeprecatedNominalValueDecimals();
    }

    /**
     * @notice Reads the ISO 4217 currency code from the dedicated storage slot.
     * @dev Unlike `getNominalValue` and `getNominalValueDecimals`, this getter does NOT aggregate
     *      legacy bond/equity `bytes3 currency` fields — those represent the issuer's reporting
     *      currency, a different concept from the nominal-value-attached currency owned here.
     * @return The ISO 4217 currency code as `bytes3`; `0x000000` when unset.
     */
    function getNominalValueCurrency() internal view returns (bytes3) {
        return _nominalValueStorage().nominalValueCurrency;
    }

    function isNominalValueInitialized() internal view returns (bool) {
        return _nominalValueStorage().initialized;
    }

    /**
     * @notice Clears legacy nominal value slots on both bond and equity storage, if populated.
     * @dev DEPRECATED – MIGRATION: remove this helper (and its two single-domain delegates) once
     *      every on-chain token has been migrated off the deprecated `BondDataStorage.nominalValue`
     *      and `EquityDataStorage.nominalValue` fields. Invoked at the start of every
     *      `setNominalValue` and (transitively) `initializeNominalValue` call so the aggregating
     *      getters never return legacy + dedicated state simultaneously.
     */
    function _migrateLegacyNominalValue() private {
        _migrateBondNominalValue();
        _migrateEquityNominalValue();
    }

    /**
     * @notice Clears the deprecated nominal value fields on `BondDataStorage`, if populated.
     * @dev Guarded by a non-zero check on the legacy amount and decimals to avoid a redundant
     *      SSTORE when the migration has already run for this token. Called as part of
     *      `_migrateLegacyNominalValue`.
     */
    function _migrateBondNominalValue() private {
        if (
            BondStorageWrapper.getDeprecatedNominalValue() > 0 ||
            BondStorageWrapper.getDeprecatedNominalValueDecimals() > 0
        ) BondStorageWrapper.clearNominalValue();
    }

    /**
     * @notice Clears the deprecated nominal value fields on `EquityDataStorage`, if populated.
     * @dev Guarded by a non-zero check on the legacy amount and decimals to avoid a redundant
     *      SSTORE when the migration has already run for this token. Called as part of
     *      `_migrateLegacyNominalValue`.
     */
    function _migrateEquityNominalValue() private {
        if (
            EquityStorageWrapper.getDeprecatedNominalValue() > 0 ||
            EquityStorageWrapper.getDeprecatedNominalValueDecimals() > 0
        ) EquityStorageWrapper.clearNominalValue();
    }

    function _nominalValueStorage() private pure returns (NominalValueDataStorage storage nvData_) {
        bytes32 position = _NOMINAL_VALUE_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            nvData_.slot := position
        }
    }
}
