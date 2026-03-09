// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { INominalValue } from "../interfaces/nominalValue/INominalValue.sol";
import { _DEFAULT_ADMIN_ROLE } from "../../layer_0/constants/roles.sol";
import { Internals } from "../../layer_0/Internals.sol";

abstract contract NominalValue is INominalValue, Internals {
    // solhint-disable-next-line func-name-mixedcase
    function initialize_NominalValue(
        uint256 _nominalValue,
        uint8 _nominalValueDecimals
    ) external override onlyUninitialized(_isNominalValueInitialized()) {
        _initialize_NominalValue(_nominalValue, _nominalValueDecimals);
        emit NominalValueSet(_msgSender(), _nominalValue, _nominalValueDecimals);
    }

    /// @dev Sets the nominal value. Migration of deprecated bond/equity fields
    /// is handled internally by _setNominalValue.
    /// MIGRATION: Once all legacy tokens have been migrated, remove the
    /// _isNominalValueInitialized check, leaving only:
    ///   _setNominalValue(_nominalValue, _nominalValueDecimals);
    function setNominalValue(
        uint256 _nominalValue,
        uint8 _nominalValueDecimals
    ) external override onlyRole(_DEFAULT_ADMIN_ROLE) {
        if (!_isNominalValueInitialized()) {
            _initialize_NominalValue(_nominalValue, _nominalValueDecimals);
        }
        _setNominalValue(_nominalValue, _nominalValueDecimals);
        emit NominalValueSet(_msgSender(), _nominalValue, _nominalValueDecimals);
    }

    function getNominalValue() external view override returns (uint256) {
        return _getNominalValue();
    }

    function getNominalValueDecimals() external view override returns (uint8) {
        return _getNominalValueDecimals();
    }
}
