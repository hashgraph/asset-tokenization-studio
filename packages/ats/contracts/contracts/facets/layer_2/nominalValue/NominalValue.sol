// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { INominalValue, RESOLVER_KEY_NOMINAL_VALUE } from "./INominalValue.sol";
import { ROLE_NOMINAL_VALUE, DEFAULT_ADMIN_ROLE } from "../../../constants/roles.sol";
import { Modifiers } from "../../../services/Modifiers.sol";
import { NominalValueStorageWrapper } from "../../../domain/asset/NominalValueStorageWrapper.sol";
import { InitializerStorageWrapper } from "../../../domain/core/InitializerStorageWrapper.sol";
import { EvmAccessors } from "../../../infrastructure/utils/EvmAccessors.sol";

/**
 * @title NominalValue
 * @author Asset Tokenization Studio Team
 * @notice Writer abstract for the nominal value capability; sole emit site for the events
 *         declared on `INominalValue`.
 * @dev Concrete facet `NominalValueFacet` registers the external onlyOperational selectors. Storage operations
 *      delegate to `NominalValueStorageWrapper`, which holds the dedicated slot.
 */
abstract contract NominalValue is INominalValue, Modifiers {
    /// @inheritdoc INominalValue
    function initializeNominalValue(
        uint256 _nominalValue,
        uint8 _nominalValueDecimals,
        bytes3 _nominalValueCurrency
    ) external override onlyRole(DEFAULT_ADMIN_ROLE) onlyFacetNotRegistered(RESOLVER_KEY_NOMINAL_VALUE) {
        NominalValueStorageWrapper.initializeNominalValue(_nominalValue, _nominalValueDecimals, _nominalValueCurrency);
        InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_NOMINAL_VALUE);
        emit NominalValueInitialized(_nominalValue, _nominalValueDecimals, _nominalValueCurrency);
    }

    /// @inheritdoc INominalValue
    function setNominalValue(
        uint256 _nominalValue,
        uint8 _nominalValueDecimals
    ) external override onlyOperational onlyActivated onlyRole(ROLE_NOMINAL_VALUE) {
        NominalValueStorageWrapper.setNominalValue(_nominalValue, _nominalValueDecimals);
        emit NominalValueSet(EvmAccessors.getMsgSender(), _nominalValue, _nominalValueDecimals);
    }

    /// @inheritdoc INominalValue
    function setNominalValueCurrency(
        bytes3 _nominalValueCurrency
    ) external override onlyOperational onlyActivated onlyRole(ROLE_NOMINAL_VALUE) {
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
