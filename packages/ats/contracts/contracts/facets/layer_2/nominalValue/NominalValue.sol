// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { INominalValue } from "./INominalValue.sol";
import { NOMINAL_VALUE_ROLE, DEFAULT_ADMIN_ROLE } from "../../../constants/roles.sol";
import { Modifiers } from "../../../services/Modifiers.sol";
import { _checkNotInitialized } from "../../../services/InitializationErrors.sol";
import { NominalValueStorageWrapper } from "../../../domain/asset/nominalValue/NominalValueStorageWrapper.sol";
import { InitializerStorageWrapper } from "../../../domain/core/InitializerStorageWrapper.sol";
import { _NOMINAL_VALUE_RESOLVER_KEY } from "../../../constants/resolverKeys.sol";
import { EvmAccessors } from "../../../infrastructure/utils/EvmAccessors.sol";

abstract contract NominalValue is INominalValue, Modifiers {
    function initializeNominalValue(
        uint256 _nominalValue,
        uint8 _nominalValueDecimals
    ) external override onlyFacetNotRegistered(_NOMINAL_VALUE_RESOLVER_KEY) onlyRole(DEFAULT_ADMIN_ROLE) {
        _checkNotInitialized(NominalValueStorageWrapper.isNominalValueInitialized());
        NominalValueStorageWrapper.initializeNominalValue(_nominalValue, _nominalValueDecimals);
        InitializerStorageWrapper.setFacetToReady(_NOMINAL_VALUE_RESOLVER_KEY);
        emit NominalValueSet(EvmAccessors.getMsgSender(), _nominalValue, _nominalValueDecimals);
    }

    /// @inheritdoc INominalValue
    function reinitializeNominalValue(
        uint256[] calldata fromVersions
    )
        external
        override
        onlyFacetRegistered(_NOMINAL_VALUE_RESOLVER_KEY, fromVersions)
        onlyFacetNotReady(_NOMINAL_VALUE_RESOLVER_KEY)
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        InitializerStorageWrapper.setFacetToReady(_NOMINAL_VALUE_RESOLVER_KEY);
    }

    /// @dev Sets the nominal value. Migration of deprecated bond/equity fields
    /// is handled internally by setNominalValue.
    /// MIGRATION: Once all legacy tokens have been migrated, remove the
    /// isNominalValueInitialized check, leaving only:
    ///   setNominalValue(_nominalValue, _nominalValueDecimals);
    function setNominalValue(
        uint256 _nominalValue,
        uint8 _nominalValueDecimals
    ) external override onlyRole(NOMINAL_VALUE_ROLE) {
        if (!NominalValueStorageWrapper.isNominalValueInitialized()) {
            NominalValueStorageWrapper.initializeNominalValue(_nominalValue, _nominalValueDecimals);
        }
        NominalValueStorageWrapper.setNominalValue(_nominalValue, _nominalValueDecimals);
        emit NominalValueSet(EvmAccessors.getMsgSender(), _nominalValue, _nominalValueDecimals);
    }

    function getNominalValue() external view override returns (uint256) {
        return NominalValueStorageWrapper.getNominalValue();
    }

    function getNominalValueDecimals() external view override returns (uint8) {
        return NominalValueStorageWrapper.getNominalValueDecimals();
    }
}
