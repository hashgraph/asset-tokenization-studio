// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";
import { IInitializer } from "./IInitializer.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { _INITIALIZER_RESOLVER_KEY } from "../../constants/resolverKeys.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";

/**
 * @title Initializer
 */
abstract contract Initializer is IInitializer, Modifiers {
    /// @inheritdoc IInitializer
    function initializeInitializer(
        uint256 _maxInitializerFacetIndex
    ) external override onlyRole(DEFAULT_ADMIN_ROLE) onlyFacetNotRegistered(_INITIALIZER_RESOLVER_KEY) {
        InitializerStorageWrapper.setMaxInitializerFacetIndex(_maxInitializerFacetIndex);
        InitializerStorageWrapper.setFacetToReady(_INITIALIZER_RESOLVER_KEY);
        emit InitializerInitialized(_maxInitializerFacetIndex);
    }

    /// @inheritdoc IInitializer
    function updateMaxInitializerFacetIndex(
        uint256 _newMaxInitializerFacetIndex
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        InitializerStorageWrapper.setMaxInitializerFacetIndex(_newMaxInitializerFacetIndex);
        emit MaxInitializerFacetIndexUpdated(EvmAccessors.getMsgSender(), _newMaxInitializerFacetIndex);
    }

    /// @inheritdoc IInitializer
    function setOperationalStatus() external returns (bool isOperational_, uint256 lastFacetIndex_) {
        bytes32 configId;
        uint256 versionId;
        (isOperational_, lastFacetIndex_, configId, versionId) = InitializerStorageWrapper.setOperationalStatus();
        if (isOperational_) {
            emit IInitializer.OperationalStatusSet(EvmAccessors.getMsgSender(), configId, versionId);
            return (isOperational_, lastFacetIndex_);
        }
        emit IInitializer.OperationalStatusPartialSet(
            EvmAccessors.getMsgSender(),
            configId,
            versionId,
            lastFacetIndex_
        );
    }

    /// @inheritdoc IInitializer
    function getOperationalStatus(bytes32 _configId, uint256 _versionId) external view returns (uint256 status_) {
        status_ = InitializerStorageWrapper.getOperationalStatus(_configId, _versionId);
    }

    /// @inheritdoc IInitializer
    function getFacetVersionStatus(bytes32 _facetId, uint256 _versionId) external view returns (uint256 status_) {
        status_ = InitializerStorageWrapper.getFacetVersionStatus(_facetId, _versionId);
    }

    /// @inheritdoc IInitializer
    function getFacetLastVersion(bytes32 _facetId) external view returns (uint256 lastVersion_) {
        lastVersion_ = InitializerStorageWrapper.getFacetLastVersion(_facetId);
    }

    /// @inheritdoc IInitializer
    function getMaxInitializerFacetIndex() external view returns (uint256 maxInitializerFacetIndex_) {
        maxInitializerFacetIndex_ = InitializerStorageWrapper.getMaxInitializerFacetIndex();
    }
}
