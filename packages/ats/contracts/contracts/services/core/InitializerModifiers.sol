// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";

/**
 * @title InitializerModifiers
 * @author Asset Tokenization Studio Team
 * @notice Abstract contract providing initializer-related modifiers.
 * @dev All modifiers delegate their check logic to InitializerStorageWrapper to avoid
 *   bytecode duplication across every function that uses them.  The active config context
 *   (configId + version) is resolved internally by the wrapper's convenience overloads.
 */
abstract contract InitializerModifiers {
    /// @notice Reverts if the current config+version has a reinitialization in progress.
    /// @dev Distinct from onlyOperational: allows status 0 (never started) but blocks
    ///   management operations (updateConfig, updateConfigVersion, updateResolver) while
    ///   facets are mid-initialization.  Error: StillPending.
    modifier onlyNotPending() {
        InitializerStorageWrapper.checkNotPending();
        _;
    }

    /// @notice Reverts unless the current config+version is fully operational (status == 1).
    /// @dev Use on all business-logic functions that require the token to be live.
    ///   Error: AssetNotOperational.
    modifier onlyOperational() {
        InitializerStorageWrapper.checkOperational();
        _;
    }

    /// @notice Reverts if the given facet version has already been marked ready.
    /// @dev The facet version is resolved from the BLR internally by the wrapper.
    ///   Error: FacetReady.
    /// @param _facetId Identifier of the facet to check.
    modifier onlyFacetNotReady(bytes32 _facetId) {
        InitializerStorageWrapper.checkFacetNotReady(_facetId);
        _;
    }

    /// @notice Reverts unless the facet's last registered version is in the accepted list.
    /// @dev Used on upgrade initializers to enforce a known upgrade path.
    ///   Error: FacetPreviousVersionNotAccepted.
    /// @param _facetId Identifier of the facet to check.
    /// @param _fromLastVersions Accepted previous versions; pass an empty array to accept any.
    modifier onlyFacetRegistered(bytes32 _facetId, uint256[] calldata _fromLastVersions) {
        InitializerStorageWrapper.checkFacetRegistered(_facetId, _fromLastVersions);
        _;
    }

    /// @notice Reverts if the facet has already been registered (last version != 0).
    /// @dev Used on fresh initializers to prevent double-initialization.
    ///   Error: FacetAlreadyRegistered.
    /// @param _facetId Identifier of the facet to check.
    modifier onlyFacetNotRegistered(bytes32 _facetId) {
        InitializerStorageWrapper.checkFacetNotRegistered(_facetId);
        _;
    }
}
