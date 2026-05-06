// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";
import { ResolverProxyStorageWrapper } from "../../domain/core/ResolverProxyStorageWrapper.sol";
import { IInitializer } from "./IInitializer.sol";

/**
 * @title Initializer
 * @author Asset Tokenization Studio Team
 * @notice Abstract contract providing the concrete implementation of IInitializer.
 * @dev Delegates all logic to InitializerStorageWrapper to keep storage access centralised.
 *   Uses composite keys (resolver + configId) for cross-config facet isolation.
 *   Inheritors (e.g. InitializerFacet) gain the external interface without duplicating code.
 */
abstract contract Initializer is IInitializer {
    /// @inheritdoc IInitializer
    function setOperationalStatus() external returns (bool isOperational_, uint256 lastFacetIndex_) {
        return InitializerStorageWrapper.setOperationalStatus();
    }

    /// @inheritdoc IInitializer
    function getLastOperationalVersion() external view returns (uint256 version_) {
        version_ = InitializerStorageWrapper.getLastOperationalVersion();
    }

    /// @inheritdoc IInitializer
    function isOperational(bytes32 _configId, uint256 _versionId) external view returns (bool isOperational_) {
        isOperational_ = InitializerStorageWrapper.getOperationalStatus(_configId, _versionId) == 1;
    }

    /// @inheritdoc IInitializer
    function getOperationalStatus(bytes32 _configId, uint256 _versionId) external view returns (uint256 status_) {
        status_ = InitializerStorageWrapper.getOperationalStatus(_configId, _versionId);
    }

    /// @inheritdoc IInitializer
    function getFacetVersionStatus(bytes32 _facetId, uint256 _versionId) external view returns (uint256 status_) {
        status_ = InitializerStorageWrapper.getFacetVersionStatus(
            address(ResolverProxyStorageWrapper.getBusinessLogicResolver()),
            ResolverProxyStorageWrapper.getResolverProxyConfigurationId(),
            _facetId,
            _versionId
        );
    }

    /// @inheritdoc IInitializer
    function getFacetLastVersion(bytes32 _facetId) external view returns (uint256 lastVersion_) {
        lastVersion_ = InitializerStorageWrapper.getFacetLastVersion(
            address(ResolverProxyStorageWrapper.getBusinessLogicResolver()),
            ResolverProxyStorageWrapper.getResolverProxyConfigurationId(),
            _facetId
        );
    }

    /// @inheritdoc IInitializer
    function getConfigInitializedCount(bytes32 _configId, uint256 _versionId) external view returns (uint256 count_) {
        count_ = InitializerStorageWrapper.getConfigInitializedCount(_configId, _versionId);
    }

    /// @inheritdoc IInitializer
    function getConfigTargetCount(bytes32 _configId, uint256 _versionId) external view returns (uint256 count_) {
        count_ = InitializerStorageWrapper.getConfigTargetCount(_configId, _versionId);
    }
}
