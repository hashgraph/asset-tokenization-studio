// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import "../EquityStorageWrapper.sol";
import { _NOMINAL_VALUE_STORAGE_POSITION } from "../../../constants/storagePositions.sol";
import { BondStorageWrapper } from "../BondStorageWrapper.sol";
import { Bond } from "../../../facets/layer_2/bond/Bond.sol";

/**
 * @title NominalValue Storage Wrapper
 * @notice Manages read and write access to the dedicated NominalValue storage slot,
 *         including aggregation with legacy bond and equity storage fields during
 *         the migration period.
 * @dev Uses EIP-2535 diamond storage pattern via a dedicated storage position
 *      (`_NOMINAL_VALUE_STORAGE_POSITION`). Aggregates values across three sources —
 *      the dedicated slot, the legacy bond slot, and the legacy equity slot — to
 *      ensure backward compatibility. Any write operation triggers automatic
 *      migration of legacy fields into the dedicated slot and clears the originals.
 *      MIGRATION: Once all legacy tokens have been migrated, remove legacy reads
 *      from `_getNominalValue` and `_getNominalValueDecimals`, and remove
 *      `_migrateBondNominalValue` and `_migrateEquityNominalValue`.
 * @author Hashgraph
 */
library NominalValueStorageWrapper {
    /**
     * @notice Persistent storage layout for the dedicated NominalValue slot.
     * @param nominalValue       The nominal value of the token, expressed in the
     *                           precision defined by `nominalValueDecimals`.
     * @param nominalValueDecimals Number of decimal places for `nominalValue`.
     * @param initialized        Flag indicating whether nominal value has been set;
     *                           guards against uninitialised reads.
     */
    struct NominalValueDataStorage {
        uint256 nominalValue;
        uint8 nominalValueDecimals;
        bool initialized;
    }

    // ============================================= LEGACY SLOT OFFSETS =============================================
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
    // ============================================ LEGACY SLOT OFFSETS =============================================

    // --- Dedicated storage ---

    // --- Dedicated accessors ---

    /**
     * @notice Initialises the dedicated NominalValue storage slot for the first time.
     * @dev Sets the `initialized` flag before delegating to `_setNominalValue`, which
     *      also triggers legacy migration. Must only be called once per token; callers
     *      are responsible for guarding against re-initialisation via
     *      `_isNominalValueInitialized`.
     * @param _nominalValue         The nominal value to persist.
     * @param _nominalValueDecimals The decimal precision for `_nominalValue`.
     */
    function _initializeNominalValue(uint256 _nominalValue, uint8 _nominalValueDecimals) internal {
        _nominalValueStorage().initialized = true;
        _setNominalValue(_nominalValue, _nominalValueDecimals);
    }

    /**
     * @notice Updates the nominal value and its decimal precision in dedicated storage.
     * @dev Triggers migration of any residual legacy bond and equity nominal values
     *      before writing, ensuring the dedicated slot becomes the sole source of truth.
     *      Overwrites any previously stored value without emitting an event; event
     *      emission is the responsibility of the calling facet.
     * @param _nominalValue         The new nominal value to persist.
     * @param _nominalValueDecimals The decimal precision for `_nominalValue`.
     */
    function _setNominalValue(uint256 _nominalValue, uint8 _nominalValueDecimals) internal {
        _migrateBondNominalValue();
        _migrateEquityNominalValue();
        NominalValueDataStorage storage nvData_ = _nominalValueStorage();
        nvData_.nominalValue = _nominalValue;
        nvData_.nominalValueDecimals = _nominalValueDecimals;
    }

    /**
     * @notice Migrates any legacy nominal value data from bond storage to the
     *         dedicated slot by clearing it at the source.
     * @dev Invokes `BondStorageWrapper.clearNominalValue` only when at least one
     *      legacy field is non-zero, avoiding unnecessary storage writes.
     *      MIGRATION: Remove once all bond tokens have been migrated.
     */
    function _migrateBondNominalValue() internal {
        if (
            BondStorageWrapper.getDeprecatedNominalValue() > 0 ||
            BondStorageWrapper.getDeprecatedNominalValueDecimals() > 0
        ) BondStorageWrapper.clearNominalValue();
    }

    /**
     * @notice Migrates any legacy nominal value data from equity storage to the
     *         dedicated slot by clearing it at the source.
     * @dev Invokes `EquityStorageWrapper.clearNominalValue` only when at least one
     *      legacy field is non-zero, avoiding unnecessary storage writes.
     *      MIGRATION: Remove once all equity tokens have been migrated.
     */
    function _migrateEquityNominalValue() internal {
        if (
            EquityStorageWrapper.getDeprecatedNominalValue() > 0 ||
            EquityStorageWrapper.getDeprecatedNominalValueDecimals() > 0
        ) EquityStorageWrapper.clearNominalValue();
    }

    /**
     * @notice Returns the effective nominal value, aggregating across all storage
     *         sources for backward compatibility.
     * @dev Sums the dedicated slot value with any residual legacy bond and equity
     *      values. Under normal post-migration conditions only the dedicated slot
     *      contributes a non-zero value. Arithmetic overflow is not guarded here;
     *      callers must ensure legacy fields are cleared promptly via migration.
     *      MIGRATION: Simplify to return only `_nominalValueStorage().nominalValue`
     *      once all legacy tokens are migrated.
     * @return The aggregate nominal value across dedicated and legacy storage slots.
     */
    function _getNominalValue() internal view returns (uint256) {
        return
            _nominalValueStorage().nominalValue +
            BondStorageWrapper.getDeprecatedNominalValue() +
            EquityStorageWrapper.getDeprecatedNominalValue();
    }

    /**
     * @notice Returns the effective nominal value decimal precision, aggregating
     *         across all storage sources for backward compatibility.
     * @dev Sums the dedicated slot decimals with any residual legacy bond and equity
     *      values. As with `_getNominalValue`, only the dedicated slot should carry a
     *      non-zero value post-migration. Overflow into `uint8` is possible if legacy
     *      fields are not cleared; migration should be triggered proactively.
     *      MIGRATION: Simplify to return only
     *      `_nominalValueStorage().nominalValueDecimals` once all legacy tokens are
     *      migrated.
     * @return The aggregate decimal precision across dedicated and legacy storage slots.
     */
    function _getNominalValueDecimals() internal view returns (uint8) {
        return
            _nominalValueStorage().nominalValueDecimals +
            BondStorageWrapper.getDeprecatedNominalValueDecimals() +
            EquityStorageWrapper.getDeprecatedNominalValueDecimals();
    }

    /**
     * @notice Indicates whether the nominal value has been initialised in the
     *         dedicated storage slot.
     * @dev Reads only the dedicated slot's `initialized` flag; legacy bond and equity
     *      storage states are not considered. Use as a precondition guard before
     *      calling `_getNominalValue` or `_getNominalValueDecimals` in contexts where
     *      uninitialised reads would be semantically invalid.
     * @return True if `_initializeNominalValue` has been called; false otherwise.
     */
    function _isNominalValueInitialized() internal view returns (bool) {
        return _nominalValueStorage().initialized;
    }

    /**
     * @notice Returns a storage pointer to the dedicated NominalValue slot.
     * @dev Resolves the slot via inline assembly using the precomputed position
     *      constant `_NOMINAL_VALUE_STORAGE_POSITION`. Follows the diamond storage
     *      pattern (EIP-2535) to prevent layout collisions with other facets.
     * @return nvData_ Storage reference to the `NominalValueDataStorage` struct.
     */
    function _nominalValueStorage() private pure returns (NominalValueDataStorage storage nvData_) {
        bytes32 position = _NOMINAL_VALUE_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            nvData_.slot := position
        }
    }
}
