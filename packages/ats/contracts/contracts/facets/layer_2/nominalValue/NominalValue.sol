// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { INominalValue } from "./INominalValue.sol";
import { NOMINAL_VALUE_ROLE, DEFAULT_ADMIN_ROLE } from "../../../constants/roles.sol";
import { _NOMINAL_VALUE_RESOLVER_KEY } from "../../../constants/resolverKeys.sol";
import { Modifiers } from "../../../services/Modifiers.sol";
import { NominalValueStorageWrapper } from "../../../domain/asset/nominalValue/NominalValueStorageWrapper.sol";
import { InitializerStorageWrapper } from "../../../domain/core/InitializerStorageWrapper.sol";
import { EvmAccessors } from "../../../infrastructure/utils/EvmAccessors.sol";

/**
 * @title NominalValue
 * @author Asset Tokenization Studio Team
 * @notice Writer abstract for the nominal value capability; sole emit site for the events
 *         declared on `INominalValue`.
 * @dev Concrete facet `NominalValueFacet` registers the external selectors. Storage operations
 *      delegate to `NominalValueStorageWrapper`, which holds the dedicated slot.
 */
abstract contract NominalValue is INominalValue, Modifiers {
    /// @inheritdoc INominalValue
    function initializeNominalValue(
        uint256 _nominalValue,
        uint8 _nominalValueDecimals,
        bytes3 _nominalValueCurrency
    ) external override onlyFacetNotRegistered(_NOMINAL_VALUE_RESOLVER_KEY) onlyRole(DEFAULT_ADMIN_ROLE) {
        NominalValueStorageWrapper.initializeNominalValue(_nominalValue, _nominalValueDecimals, _nominalValueCurrency);
        InitializerStorageWrapper.setFacetToReady(_NOMINAL_VALUE_RESOLVER_KEY);
        emit NominalValueInitialized(
            EvmAccessors.getMsgSender(),
            _nominalValue,
            _nominalValueDecimals,
            _nominalValueCurrency
        );
    }

    /// @inheritdoc INominalValue
    function setNominalValue(
        uint256 _nominalValue,
        uint8 _nominalValueDecimals
    ) external override onlyActivated onlyRole(NOMINAL_VALUE_ROLE) {
        NominalValueStorageWrapper.setNominalValue(_nominalValue, _nominalValueDecimals);
        emit NominalValueSet(EvmAccessors.getMsgSender(), _nominalValue, _nominalValueDecimals);
    }

    /// @inheritdoc INominalValue
    function setNominalValueCurrency(
        bytes3 _nominalValueCurrency
    ) external override onlyActivated onlyRole(NOMINAL_VALUE_ROLE) {
        NominalValueStorageWrapper.setNominalValueCurrency(_nominalValueCurrency);
        emit NominalValueCurrencySet(EvmAccessors.getMsgSender(), _nominalValueCurrency);
    }

    /// @inheritdoc INominalValue
    function getNominalValue() external view override returns (uint256) {
        return NominalValueStorageWrapper.getNominalValue();
    }

    /// @inheritdoc INominalValue
    function getNominalValueDecimals() external view override returns (uint8) {
        return NominalValueStorageWrapper.getNominalValueDecimals();
    }

    /// @inheritdoc INominalValue
    function getNominalValueCurrency() external view override returns (bytes3) {
        return NominalValueStorageWrapper.getNominalValueCurrency();
    }
}
