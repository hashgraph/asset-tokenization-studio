// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";

/**
 * @title InitializerModifiers
 * @author Asset Tokenization Studio Team
 * @notice Pure-guard modifiers for facet initialisation lifecycle.
 * @dev Every modifier is a zero-side-effect guard: it checks a condition and reverts on failure,
 *   then passes through to `_;`.  No state mutations, no post-actions.
 */
abstract contract InitializerModifiers {
    /**
     * @notice Guards a function so it executes only when the asset's current
     *   configuration and version are fully operational.
     * @dev Delegates to InitializerStorageWrapper.checkOperational(), which
     *   reverts with IInitializer.AssetNotOperational when the status is not 1.
     *   Used by initialiser facets after the entire facet set has been marked
     *   ready.
     */
    modifier onlyOperational() {
        InitializerStorageWrapper.checkOperational();
        _;
    }

    /**
     * @notice Guards a function so it executes only when the specified facet
     *   is not yet ready (i.e. its version status is not 1).
     * @dev Delegates to InitializerStorageWrapper.checkFacetNotReady(), which
     *   resolves the facet's current version from the BLR internally and
     *   reverts with IInitializer.FacetReady if the facet is already marked.
     * @param _facetId Identifier of the facet to check.
     */
    modifier onlyFacetNotReady(bytes32 _facetId) {
        InitializerStorageWrapper.checkFacetNotReady(_facetId);
        _;
    }

    /**
     * @notice Guards a function so it executes only when the facet's last
     *   registered version is among the accepted previous versions.
     * @dev Delegates to InitializerStorageWrapper.checkFacetRegistered(),
     *   which reverts with IInitializer.FacetPreviousVersionNotAccepted when
     *   the facet's lastVersion is not in _fromLastVersions.  Used on upgrade
     *   initialisers to enforce a known upgrade path.
     * @param _facetId Identifier of the facet to check.
     * @param _fromLastVersions Accepted previous versions; an empty array
     *   rejects all.
     */
    modifier onlyFacetRegistered(bytes32 _facetId, uint256[] calldata _fromLastVersions) {
        InitializerStorageWrapper.checkFacetRegistered(_facetId, _fromLastVersions);
        _;
    }

    /**
     * @notice Guards a function so it executes only when the facet has never
     *   been registered (last version equals 0).
     * @dev Delegates to InitializerStorageWrapper.checkFacetNotRegistered(),
     *   which reverts with IInitializer.FacetAlreadyRegistered if the facet's
     *   lastVersion is non-zero.  Used on fresh initialisers to prevent
     *   double-initialisation.
     * @param _facetId Identifier of the facet to check.
     */
    modifier onlyFacetNotRegistered(bytes32 _facetId) {
        InitializerStorageWrapper.checkFacetNotRegistered(_facetId);
        _;
    }
}
