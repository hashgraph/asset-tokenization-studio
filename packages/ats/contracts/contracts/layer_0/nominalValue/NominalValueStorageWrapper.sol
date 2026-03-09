// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _NOMINAL_VALUE_STORAGE_POSITION } from "../../layer_2/constants/storagePositions.sol";
import { ERC20PermitStorageWrapper } from "../ERC1400/ERC20Permit/ERC20PermitStorageWrapper.sol";

abstract contract NominalValueStorageWrapper is ERC20PermitStorageWrapper {
    struct NominalValueDataStorage {
        uint256 nominalValue;
        bool initialized;
        uint8 nominalValueDecimals;
    }

    /// @dev Initializes the nominal value in the new dedicated storage.
    function _initializeNominalValue(uint256 _nominalValue, uint8 _nominalValueDecimals) internal virtual override {
        NominalValueDataStorage storage nvStorage = _nominalValueStorage();
        nvStorage.nominalValue = _nominalValue;
        nvStorage.nominalValueDecimals = _nominalValueDecimals;
        nvStorage.initialized = true;
    }

    /// @dev Sets the nominal value in the new dedicated storage. Clears any
    /// deprecated bond/equity fields to avoid double-counting in the aggregated sum.
    /// MIGRATION: Once all legacy tokens have been migrated, remove the two _migrate* calls.
    function _setNominalValue(uint256 _nominalValue, uint8 _nominalValueDecimals) internal virtual override {
        _migrateBondNominalValueIfNeeded();
        _migrateEquityNominalValueIfNeeded();
        NominalValueDataStorage storage nvStorage = _nominalValueStorage();
        nvStorage.nominalValue = _nominalValue;
        nvStorage.nominalValueDecimals = _nominalValueDecimals;
    }

    /// @dev Returns the aggregated nominal value from the new dedicated storage plus the
    /// deprecated bond and equity storage fields. This sum ensures backward compatibility:
    /// only one source will hold a non-zero value at any time.
    /// MIGRATION: Once all legacy tokens have been migrated, simplify to:
    ///   return _nominalValueStorage().nominalValue;
    function _getNominalValue() internal view virtual override returns (uint256) {
        return _nominalValueStorage().nominalValue + _bondNominalValue() + _equityNominalValue();
    }

    /// @dev Returns the aggregated nominal value decimals from the new dedicated storage plus
    /// the deprecated bond and equity storage fields. This sum ensures backward compatibility:
    /// only one source will hold a non-zero value at any time.
    /// MIGRATION: Once all legacy tokens have been migrated, simplify to:
    ///   return _nominalValueStorage().nominalValueDecimals;
    function _getNominalValueDecimals() internal view virtual override returns (uint8) {
        return
            _nominalValueStorage().nominalValueDecimals + _bondNominalValueDecimals() + _equityNominalValueDecimals();
    }

    function _isNominalValueInitialized() internal view virtual override returns (bool) {
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
