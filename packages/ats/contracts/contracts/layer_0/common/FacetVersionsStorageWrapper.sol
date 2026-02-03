// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _FACET_VERSIONS_STORAGE_POSITION } from "../constants/storagePositions.sol";

/**
 * @title FacetVersionsStorageWrapper
 * @notice Centralized version storage for Diamond pattern facet reinitialization
 * @dev Uses a single storage slot with mapping to track version of each facet.
 *      This enables facets to be upgraded and reinitialized with version-gated logic.
 *
 * Storage Pattern:
 * - Single mapping(bytes32 => uint64) for all facet versions
 * - Each facet has a unique key (from facetKeys.sol)
 * - Version starts at 0 (uninitialized) and increments with each initialization
 *
 * Usage in Facets:
 * 1. Check current version: uint64 v = _getFacetVersion(FACET_KEY)
 * 2. Execute version-gated blocks: if (v < 1) { ... } if (v < 2) { ... }
 * 3. Update version: _setFacetVersion(FACET_KEY, TARGET_VERSION)
 */
abstract contract FacetVersionsStorageWrapper {
    struct FacetVersionsStorage {
        mapping(bytes32 => uint64) versions;
    }

    /// @notice Emitted when a facet version is rolled back
    event FacetVersionRolledBack(bytes32 indexed facetKey, uint64 fromVersion, uint64 toVersion);

    /// @notice Reverts when attempting to reinitialize a facet already at the target version
    error AlreadyAtLatestVersion(bytes32 facetKey, uint64 currentVersion, uint64 targetVersion);

    /// @notice Reverts when rollback target version is invalid (>= current version)
    error InvalidRollbackTarget(bytes32 facetKey, uint64 targetVersion, uint64 currentVersion);

    /// @notice Reverts when trying to rollback below the minimum supported version
    error CannotRollbackBelowMinVersion(bytes32 facetKey, uint64 minVersion);

    /**
     * @notice Set the version for a facet
     * @param facetKey The unique identifier for the facet
     * @param version The new version number
     */
    function _setFacetVersion(bytes32 facetKey, uint64 version) internal {
        _facetVersionsStorage().versions[facetKey] = version;
    }

    /**
     * @notice Get the current version for a facet
     * @param facetKey The unique identifier for the facet (from facetKeys.sol)
     * @return The current version number (0 if never initialized)
     */
    function _getFacetVersion(bytes32 facetKey) internal view returns (uint64) {
        return _facetVersionsStorage().versions[facetKey];
    }

    /**
     * @notice Access the facet versions storage
     * @return ds The storage struct at the designated position
     */
    function _facetVersionsStorage() internal pure returns (FacetVersionsStorage storage ds) {
        bytes32 position = _FACET_VERSIONS_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            ds.slot := position
        }
    }
}
