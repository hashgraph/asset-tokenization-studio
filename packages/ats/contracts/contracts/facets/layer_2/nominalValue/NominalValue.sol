// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { INominalValue } from "./INominalValue.sol";
import { _NOMINAL_VALUE_ROLE } from "../../../constants/roles.sol";
import { AlreadyInitialized } from "../../../infrastructure/errors/CommonErrors.sol";
import { Modifiers } from "../../../services/Modifiers.sol";
import { NominalValueStorageWrapper } from "../../../domain/asset/nominalValue/NominalValueStorageWrapper.sol";
import { EvmAccessors } from "../../../infrastructure/utils/EvmAccessors.sol";

abstract contract NominalValue is INominalValue, Modifiers {
    // solhint-disable-next-line func-name-mixedcase
    function initialize_NominalValue(uint256 _nominalValue, uint8 _nominalValueDecimals) external override {
        if (NominalValueStorageWrapper._isNominalValueInitialized()) revert AlreadyInitialized();
        NominalValueStorageWrapper._initializeNominalValue(_nominalValue, _nominalValueDecimals);
        emit NominalValueSet(EvmAccessors.getMsgSender(), _nominalValue, _nominalValueDecimals);
    }

    /// @dev Sets the nominal value. Migration of deprecated bond/equity fields
    /// is handled internally by _setNominalValue.
    /// MIGRATION: Once all legacy tokens have been migrated, remove the
    /// _isNominalValueInitialized check, leaving only:
    ///   _setNominalValue(_nominalValue, _nominalValueDecimals);
    function setNominalValue(
        uint256 _nominalValue,
        uint8 _nominalValueDecimals
    ) external override onlyRole(_NOMINAL_VALUE_ROLE) {
        if (!NominalValueStorageWrapper._isNominalValueInitialized()) {
            NominalValueStorageWrapper._initializeNominalValue(_nominalValue, _nominalValueDecimals);
        }
        NominalValueStorageWrapper._setNominalValue(_nominalValue, _nominalValueDecimals);
        emit NominalValueSet(EvmAccessors.getMsgSender(), _nominalValue, _nominalValueDecimals);
    }

    function getNominalValue() external view override returns (uint256) {
        return NominalValueStorageWrapper._getNominalValue();
    }

    function getNominalValueDecimals() external view override returns (uint8) {
        return NominalValueStorageWrapper._getNominalValueDecimals();
    }
}
