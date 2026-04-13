// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import "../EquityStorageWrapper.sol";
import {
    _NOMINAL_VALUE_STORAGE_POSITION,
    _BOND_STORAGE_POSITION,
    _EQUITY_STORAGE_POSITION
} from "../../../constants/storagePositions.sol";
import { BondStorageWrapper } from "../BondStorageWrapper.sol";
import { Bond } from "../../../facets/layer_2/bond/Bond.sol";

/// @notice Storage wrapper for NominalValue feature.
/// @dev Reads nominal value from the dedicated NominalValue slot, and aggregates
/// with legacy bond/equity storage fields for backward compatibility during migration.
/// MIGRATION: Once all legacy tokens have been migrated, remove the legacy reads
/// and simplify _getNominalValue / _getNominalValueDecimals to return only the
/// dedicated storage values.
library NominalValueStorageWrapper {
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

    function _initializeNominalValue(uint256 _nominalValue, uint8 _nominalValueDecimals) internal {
        _nominalValueStorage().initialized = true;
        _setNominalValue(_nominalValue, _nominalValueDecimals);
    }

    function _setNominalValue(uint256 _nominalValue, uint8 _nominalValueDecimals) internal {
        _migrateBondNominalValue();
        _migrateEquityNominalValue();

        NominalValueDataStorage storage nvData_ = _nominalValueStorage();
        nvData_.nominalValue = _nominalValue;
        nvData_.nominalValueDecimals = _nominalValueDecimals;
    }

    function _migrateBondNominalValue() internal {
        if (
            BondStorageWrapper.getDeprecatedNominalValue() > 0 ||
            BondStorageWrapper.getDeprecatedNominalValueDecimals() > 0
        ) BondStorageWrapper.clearNominalValue();
    }

    function _migrateEquityNominalValue() internal {
        if (
            EquityStorageWrapper.getDeprecatedNominalValue() > 0 ||
            EquityStorageWrapper.getDeprecatedNominalValueDecimals() > 0
        ) EquityStorageWrapper.clearNominalValue();
    }

    function _getNominalValue() internal view returns (uint256) {
        return
            _nominalValueStorage().nominalValue +
            BondStorageWrapper.getDeprecatedNominalValue() +
            EquityStorageWrapper.getDeprecatedNominalValue();
    }

    function _getNominalValueDecimals() internal view returns (uint8) {
        return
            _nominalValueStorage().nominalValueDecimals +
            BondStorageWrapper.getDeprecatedNominalValueDecimals() +
            EquityStorageWrapper.getDeprecatedNominalValueDecimals();
    }

    function _isNominalValueInitialized() internal view returns (bool) {
        return _nominalValueStorage().initialized;
    }

    function _nominalValueStorage() private pure returns (NominalValueDataStorage storage nvData_) {
        bytes32 position = _NOMINAL_VALUE_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            nvData_.slot := position
        }
    }
}
