// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { INominalValue, RESOLVER_KEY_NOMINAL_VALUE } from "./INominalValue.sol";
import { ROLE_NOMINAL_VALUE, DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { NominalValueStorageWrapper } from "../../domain/asset/NominalValueStorageWrapper.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";

/**
 * @title NominalValue
 * @author Asset Tokenization Studio Team
 * @notice Writer abstract for the nominal value capability; sole emit site for the events
 *         declared on `INominalValue`.
 * @dev    Delegates all storage reads and writes to `NominalValueStorageWrapper`, which owns
 *         the dedicated storage slot. Access guards are enforced via `Modifiers`.
 */
abstract contract NominalValue is INominalValue, Modifiers {
    /// @inheritdoc INominalValue
    function initializeNominalValue(
        uint256 _nominalValue,
        uint256 _nominalValueDecimals,
        bytes3 _nominalValueCurrency,
        uint256 _effectiveDatetime,
        bool _isUnitNominalValue
    )
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyFacetNotRegistered(RESOLVER_KEY_NOMINAL_VALUE)
        onlyValidTimestamp(_effectiveDatetime)
        onlyPastTimestamp(_effectiveDatetime)
    {
        NominalValueStorageWrapper.initializeNominalValue(
            _nominalValue,
            _nominalValueDecimals,
            _nominalValueCurrency,
            _effectiveDatetime,
            _isUnitNominalValue
        );
        InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_NOMINAL_VALUE);
        emit NominalValueInitialized(_nominalValue, _nominalValueDecimals, _nominalValueCurrency);
    }

    /// @inheritdoc INominalValue
    function publishNominalValue(
        uint256 _nominalValue,
        uint256 _effectiveDatetime
    )
        external
        override
        onlyOperational
        onlyActivated
        onlyRole(ROLE_NOMINAL_VALUE)
        onlyValidPublishDatetime(_effectiveDatetime)
        onlyPastTimestamp(_effectiveDatetime)
    {
        NominalValueStorageWrapper.writeNominalValue(_nominalValue, _effectiveDatetime);
        emit NominalValuePublished(EvmAccessors.getMsgSender(), _nominalValue, _effectiveDatetime);
    }

    /// @inheritdoc INominalValue
    function republishNominalValue(
        uint256 _nominalValue,
        uint256 _effectiveDatetime
    )
        external
        override
        onlyOperational
        onlyActivated
        onlyRole(ROLE_NOMINAL_VALUE)
        onlyValidRepublishDatetime(_effectiveDatetime)
    {
        NominalValueStorageWrapper.writeNominalValue(_nominalValue, _effectiveDatetime);
        emit NominalValueRepublished(EvmAccessors.getMsgSender(), _nominalValue, _effectiveDatetime);
    }

    /// @inheritdoc INominalValue
    function getNominalValue() external view override returns (uint256) {
        return NominalValueStorageWrapper.getNominalValue();
    }

    /// @inheritdoc INominalValue
    function getNominalValueDecimals() external view override returns (uint256) {
        return NominalValueStorageWrapper.getNominalValueDecimals();
    }

    /// @inheritdoc INominalValue
    function getNominalValueCurrency() external view override returns (bytes3) {
        return NominalValueStorageWrapper.getNominalValueCurrency();
    }

    /// @inheritdoc INominalValue
    function getIsUnitNominalValue() external view override returns (bool) {
        return NominalValueStorageWrapper.getIsUnitNominalValue();
    }
}
