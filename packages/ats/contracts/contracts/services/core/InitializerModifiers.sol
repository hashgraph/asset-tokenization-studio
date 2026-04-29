// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";
import { ResolverProxyStorageWrapper } from "../../domain/core/ResolverProxyStorageWrapper.sol";

/**
 * @title InitializerModifiers
 * @notice Abstract contract providing initializer-related modifiers
 * @dev Provides modifiers for initializer state validation using _check* pattern
 *      from InitializerStorageWrapper
 * @author Asset Tokenization Studio Team
 */
abstract contract InitializerModifiers {
    modifier onlyOperational() {
        InitializerStorageWrapper.checkOperational(
            ResolverProxyStorageWrapper.getResolverProxyConfigurationId(),
            ResolverProxyStorageWrapper.getResolverProxyVersion()
        );
        _;
    }

    // Using the Facet address (immutable variable) retrieves facet id and version from the BLR
    // Checks facetVersionStatus against reserved value "ready"
    modifier onlyFacetNotReady(bytes32 _facetId) {
        uint256 versionId = ResolverProxyStorageWrapper
            .getBusinessLogicResolver()
            .getFacetVersionByConfigurationIdVersionAndFacetId(
                ResolverProxyStorageWrapper.getResolverProxyConfigurationId(),
                ResolverProxyStorageWrapper.getResolverProxyVersion(),
                _facetId
            );
        InitializerStorageWrapper.checkFacetNotReady(_facetId, versionId);
        _;
    }

    // Using the Facet address (immutable variable) retrieves facet id from the BLR
    // Checks facetLastVersion
    // Makes sure that an upgrade method is only executed if the previous facet version was in a list of accepted ones.
    // "empty array" means that all previous versions are accepted.
    modifier onlyFacetRegistered(bytes32 _facetId, uint256[] calldata _fromLastVersions) {
        InitializerStorageWrapper.checkFacetRegistered(_facetId, _fromLastVersions);
        _;
    }

    // If last version == 0
    modifier onlyFacetNotRegistered(bytes32 _facetId) {
        InitializerStorageWrapper.checkFacetNotRegistered(_facetId);
        _;
    }
}
