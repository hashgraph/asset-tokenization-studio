// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";
import { ResolverProxyStorageWrapper } from "../../domain/core/ResolverProxyStorageWrapper.sol";

/**
 * @title InitializerModifiers
 * @notice Provides reusable guards for initializer and facet registration workflows.
 * @dev Delegates validation to `InitializerStorageWrapper`; each modifier reverts through
 *      the wrapper when the required resolver or initializer state is not satisfied.
 * @author Asset Tokenization Studio Team
 */
abstract contract InitializerModifiers {
    /**
     * @notice Restricts execution to an operational initialisation context.
     * @dev Requires the underlying initializer storage to report an operational state.
     */
    modifier onlyOperational() {
        InitializerStorageWrapper.checkOperational();
        _;
    }

    /**
     * @notice Restricts execution to facets whose current version is not ready.
     * @dev Uses the facet identifier to validate readiness through initializer storage.
     * @param _facetId Identifier of the facet whose readiness status is checked.
     */
    modifier onlyFacetNotReady(bytes32 _facetId) {
        InitializerStorageWrapper.checkFacetNotReady(_facetId);
        _;
    }

    /**
     * @notice Restricts execution to registered facets with an accepted previous version.
     * @dev An empty `_fromLastVersions` list accepts any registered previous version.
     * @param _facetId Identifier of the facet whose registration state is checked.
     * @param _fromLastVersions Accepted previous facet versions for the operation.
     */
    modifier onlyFacetRegistered(bytes32 _facetId, uint256[] memory _fromLastVersions) {
        InitializerStorageWrapper.checkFacetRegistered(_facetId, _fromLastVersions);
        _;
    }

    /**
     * @notice Restricts execution to facets with no registered previous version.
     * @dev Requires the facet last-version value to be unset in initializer storage.
     * @param _facetId Identifier of the facet whose absence from registration is checked.
     */
    modifier onlyFacetNotRegistered(bytes32 _facetId) {
        InitializerStorageWrapper.checkFacetNotRegistered(_facetId);
        _;
    }
}
