// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ResolverProxyStorageWrapper } from "./ResolverProxyStorageWrapper.sol";
import { IDiamondCutManager } from "../../infrastructure/diamond/IDiamondCutManager.sol";
import { IInitializer } from "../../facets/initializer/IInitializer.sol";

/// @custom:hash storage Initializer
bytes32 constant STORAGE_LOCATION_INITIALIZER = 0x7f2d07b09acba6319339222a47bfb11d5f72a81023b8b3e9ec77c77ec694f200;

/**
 * @notice Diamond-storage layout backing the initializer facet.
 * @dev Tracks operational status per `(configurationId, version)` and initialisation status per
 *      `(facetId, version)`. Status encodings:
 *      - `configVersionStatus`: `0` not started, `1` fully operational, `>1` resume facet index + 1.
 *      - `facetVersionStatus`: `0` not started, `1` ready, `>1` initialisation in progress
 *        (intermediate value defined by each facet's own initialiser).
 *      `facetLastVersion` records the latest version per facet (`0` when never registered) and is
 *      consulted by predecessor checks during upgrades. New fields must be appended below the
 *      APPEND-ONLY marker to preserve upgrade safety.
 * @custom:storage-location erc7201:security.token.standard.storage.Initializer
 */
struct InitializerDataStorage {
    // ─── R3 Single-slot scalars (uint256, bytes32, string) ───
    uint256 maxInitializerFacetIndex;
    // ─── R4 Aggregates (mapping, array, EnumerableSet) ───────
    // configVersionStatus encoding: 0 = not started, 1 = fully operational, >1 = (resume facet index + 1)
    mapping(bytes32 configId => mapping(uint256 versionId => uint256 status)) configVersionStatus;
    // facetVersionStatus: 1 means the facet version is ready
    mapping(bytes32 facetId => mapping(uint256 versionId => uint256 status)) facetVersionStatus;
    mapping(bytes32 facetId => uint256 version) facetLastVersion;
    // ─── APPEND-ONLY ZONE BELOW ───
}

/**
 * @title InitializerStorageWrapper
 * @author Asset Tokenization Studio Team
 * @notice Library providing the storage operations and readiness checks consumed by the
 *         initializer facet and by every facet that needs to assert "operational" status
 *         before executing business logic.
 * @dev Pins `InitializerDataStorage` to a fixed slot via the ERC-2535 diamond-storage pattern,
 *      preventing layout collisions across facets. All functions are `internal`; callers are
 *      expected to be facets compiled into the same proxy. Status semantics are documented on
 *      `InitializerDataStorage`. The batched `setOperationalStatus` flow persists resume
 *      progress so that bounded-gas calls can complete validation of large facet lists across
 *      multiple transactions.
 */
library InitializerStorageWrapper {
    /**
     * @notice Sets the highest initializer facet index available for initialisation.
     * @dev Updates initializer storage directly. Callers must enforce any required
     * access control and ensure the index matches the deployed initializer facet set.
     * @param _maxInitializerFacetIndex Maximum initializer facet index to store.
     */
    function setMaxInitializerFacetIndex(uint256 _maxInitializerFacetIndex) internal {
        initializerStorage().maxInitializerFacetIndex = _maxInitializerFacetIndex;
    }

    /**
     * @notice Walks the facet list of the active resolver-proxy configuration version, in
     *         batches bounded by `maxInitializerFacetIndex`, and marks the configuration
     *         operational once every facet is ready.
     * @dev Idempotent and resumable. The encoding stored in `configVersionStatus` is:
     *      `0` = not started, `1` = fully operational, `>1` = resume facet index + 1. The
     *      function reads the active configuration via `ResolverProxyStorageWrapper`, pulls
     *      the relevant facet range from the business-logic resolver, and walks it until the
     *      first non-ready facet (recording where to resume) or the end of the list (marking
     *      the configuration operational). Emits `OperationalStatusSet` on completion or
     *      `OperationalStatusPartialSet` on partial progress.
     * @return isOperational_ True when every facet of the configuration version is ready.
     * @return lastFacetIndex_ Index reached in this call; on partial progress, the next call
     *         resumes here. Zero when the configuration was already operational.
     * @return configId_ Resolver-proxy configuration identifier this call evaluated.
     * @return versionId_ Configuration version this call evaluated.
     */
    // Verifies that every facet of the current config+version is ready, in batches of MAX_INITIALIZER_FACET_INDEX.
    // Persists progress so next calls resume where the previous one stopped, until the whole config is operational.
    function setOperationalStatus()
        internal
        returns (bool isOperational_, uint256 lastFacetIndex_, bytes32 configId_, uint256 versionId_)
    {
        configId_ = ResolverProxyStorageWrapper.getResolverProxyConfigurationId();
        versionId_ = ResolverProxyStorageWrapper.getResolverProxyVersion();

        uint256 operationStatus = getOperationalStatus(configId_, versionId_);

        // Already fully operational — nothing to do.
        if (operationStatus == 1) {
            return (true, 0, configId_, versionId_);
        }

        uint256 nextFacetIndex;
        unchecked {
            nextFacetIndex = operationStatus > 1 ? operationStatus - 1 : 0;
        }

        unchecked {
            lastFacetIndex_ = getMaxInitializerFacetIndex() + nextFacetIndex;
        }

        uint256 facetsLength = ResolverProxyStorageWrapper
            .getBusinessLogicResolver()
            .getFacetsLengthByConfigurationIdAndVersion(configId_, versionId_);

        if (facetsLength < lastFacetIndex_) {
            lastFacetIndex_ = facetsLength;
        }

        IDiamondCutManager.FacetConfiguration[] memory facetConfigurations = ResolverProxyStorageWrapper
            .getBusinessLogicResolver()
            .getFacetConfigurationsByConfigurationIdAndVersion(configId_, versionId_, nextFacetIndex, lastFacetIndex_);

        (isOperational_, lastFacetIndex_) = _checkFacetsReady(
            facetConfigurations,
            nextFacetIndex,
            facetsLength,
            lastFacetIndex_
        );

        unchecked {
            initializerStorage().configVersionStatus[configId_][versionId_] = isOperational_ ? 1 : lastFacetIndex_ + 1;
        }
    }

    /**
     * @notice Marks a facet as ready for its current version and records that version as the
     *         facet's last registered version.
     * @dev The facet's current version is resolved against the business-logic resolver using
     *      the active configuration of the proxy.
     * @param _facetId Identifier of the facet being marked ready.
     */
    function setFacetToReady(bytes32 _facetId) internal {
        uint256 versionId = currentFacetVersion(_facetId);
        setFacetStatusForVersion(_facetId, versionId, 1);
        setFacetLastVersionTo(_facetId, versionId);
    }

    /**
     * @notice Writes an arbitrary status value for the facet's current version without
     *         touching its last registered version.
     * @dev Intended for multi-step facet initialisers that need to record an
     *      in-progress intermediate state (`>1`) before eventually transitioning to ready
     *      (`1`). The exact intermediate value is defined by the facet implementation.
     * @param _facetId Identifier of the facet whose status is being written.
     * @param _status Status value to store for the facet's current version (`>1` denotes
     *        "initialisation in progress").
     */
    function setFacetToCustomStatus(bytes32 _facetId, uint256 _status) internal {
        setFacetStatusForVersion(_facetId, currentFacetVersion(_facetId), _status);
    }

    /**
     * @notice Writes a status value for a specific `(facetId, versionId)` pair.
     * @dev Encoding: `0` = initialisation not started, `1` = ready, `>1` = initialisation in
     *      progress (intermediate value defined by the facet implementation).
     * @param _facetId Identifier of the facet whose status is being written.
     * @param _versionId Facet version being updated.
     * @param _status Status value to store, following the encoding above.
     */
    function setFacetStatusForVersion(bytes32 _facetId, uint256 _versionId, uint256 _status) internal {
        initializerStorage().facetVersionStatus[_facetId][_versionId] = _status;
    }

    /**
     * @notice Records the latest registered version of a facet, used by `getFacetLastVersion`
     *         and by predecessor-version checks in upgrade flows.
     * @param _facetId Identifier of the facet whose last version is being recorded.
     * @param _versionId Version to store as the facet's latest registered version.
     */
    function setFacetLastVersionTo(bytes32 _facetId, uint256 _versionId) internal {
        initializerStorage().facetLastVersion[_facetId] = _versionId;
    }

    /// @notice Sets the operational status for a configuration version.
    /// @dev Used by tests (via MockDiamondCut.forceNonOperational()) to set status to 0
    ///      and by `setOperationalStatus` flow to set status to 1 after full initialisation.
    /// @param configId Resolver-proxy configuration.
    /// @param versionId Configuration version.
    /// @param status Status value: 0 = not started, 1 = fully operational.
    function setConfigVersion(bytes32 configId, uint256 versionId, uint256 status) internal {
        initializerStorage().configVersionStatus[configId][versionId] = status;
    }

    /**
     * @notice Reverts if the proxy's active `(configurationId, version)` is not marked
     *         operational. Convenience wrapper used by other facets as a precondition guard.
     * @dev Reads the active configuration from `ResolverProxyStorageWrapper` and delegates the
     *      check to `isConfigVersionOperational`. Reverts with `IInitializer.AssetNotOperational`.
     */
    function checkOperational() internal view {
        isConfigVersionOperational(
            ResolverProxyStorageWrapper.getResolverProxyConfigurationId(),
            ResolverProxyStorageWrapper.getResolverProxyVersion()
        );
    }

    /**
     * @notice Reverts if a specific resolver-proxy configuration version is not operational.
     * @dev Reverts with `IInitializer.AssetNotOperational(configId, versionId)` when the
     *      stored status is not `1`.
     * @param configId Resolver-proxy configuration to check.
     * @param versionId Configuration version to check.
     */
    function isConfigVersionOperational(bytes32 configId, uint256 versionId) internal view {
        if (getOperationalStatus(configId, versionId) != 1) {
            revert IInitializer.AssetNotOperational(configId, versionId);
        }
    }

    /**
     * @notice Reverts if a facet is already flagged as ready for its current version. Used to
     *         block double initialisation during upgrades or fresh installs.
     * @dev Reverts with `IInitializer.FacetReady(facetId, versionId)`.
     * @param _facetId Identifier of the facet being checked.
     */
    function checkFacetNotReady(bytes32 _facetId) internal view {
        uint256 versionId = currentFacetVersion(_facetId);
        if (getFacetVersionStatus(_facetId, versionId) == 1) {
            revert IInitializer.FacetReady(_facetId, versionId);
        }
    }

    /**
     * @notice Reverts unless the facet's last registered version matches one of the supplied
     *         predecessor versions. Used by upgrade initialisers to gate the path from an
     *         accepted previous version to the current one.
     * @dev Reverts with `IInitializer.FacetPreviousVersionNotAccepted(facetId, lastVersion,
     *      expectedVersions)`. The lookup is a linear scan over `_fromLastVersions`; callers
     *      should keep this list short.
     * @param _facetId Identifier of the facet being checked.
     * @param _fromLastVersions Versions accepted as immediate predecessors of the current one.
     */
    function checkFacetRegistered(bytes32 _facetId, uint256[] memory _fromLastVersions) internal view {
        uint256 i;
        uint256 lastVersion = InitializerStorageWrapper.getFacetLastVersion(_facetId);
        uint256 length = _fromLastVersions.length;
        while (i < length) {
            if (lastVersion == _fromLastVersions[i]) {
                return;
            }
            unchecked {
                ++i;
            }
        }
        revert IInitializer.FacetPreviousVersionNotAccepted(_facetId, lastVersion, _fromLastVersions);
    }

    /**
     * @notice Reverts if the facet has any non-zero last registered version. Used by fresh
     *         initialisers to assert that the facet has never been registered before.
     * @dev Reverts with `IInitializer.FacetAlreadyRegistered(facetId, lastVersion)`.
     * @param _facetId Identifier of the facet being checked.
     */
    // If last version == 0
    function checkFacetNotRegistered(bytes32 _facetId) internal view {
        if (InitializerStorageWrapper.getFacetLastVersion(_facetId) != 0) {
            revert IInitializer.FacetAlreadyRegistered(
                _facetId,
                InitializerStorageWrapper.getFacetLastVersion(_facetId)
            );
        }
    }

    /**
     * @notice Returns the raw operational status of a configuration version, using the
     *         encoding documented on `InitializerDataStorage`.
     * @param _configId Resolver-proxy configuration to query.
     * @param _versionId Configuration version to query.
     * @return status_ Encoded operational status (`0` not started, `1` operational, `>1`
     *         resume facet index + 1).
     */
    function getOperationalStatus(bytes32 _configId, uint256 _versionId) internal view returns (uint256 status_) {
        return initializerStorage().configVersionStatus[_configId][_versionId];
    }

    /**
     * @notice Returns the initialisation status of a `(facetId, versionId)` pair.
     * @dev Encoding: `0` = initialisation not started, `1` = ready, `>1` = initialisation in
     *      progress (intermediate value defined by the facet implementation).
     * @param _facetId Identifier of the facet to query.
     * @param _versionId Facet version to query.
     * @return status_ Initialisation status of the requested facet version.
     */
    function getFacetVersionStatus(bytes32 _facetId, uint256 _versionId) internal view returns (uint256 status_) {
        return initializerStorage().facetVersionStatus[_facetId][_versionId];
    }

    /**
     * @notice Returns the latest version recorded for a facet. Zero means never registered.
     * @param _facetId Identifier of the facet to query.
     * @return lastVersion_ Most recent version stored for the facet, or zero if absent.
     */
    function getFacetLastVersion(bytes32 _facetId) internal view returns (uint256 lastVersion_) {
        return initializerStorage().facetLastVersion[_facetId];
    }

    /**
     * @notice Returns the configured batch size used by `setOperationalStatus` to bound the
     *         number of facets validated per call.
     * @return maxInitializerFacetIndex_ Maximum number of facets per call.
     */
    function getMaxInitializerFacetIndex() internal view returns (uint256 maxInitializerFacetIndex_) {
        return initializerStorage().maxInitializerFacetIndex;
    }

    /**
     * @notice Resolves the current version of a facet as advertised by the business-logic
     *         resolver for the proxy's active configuration.
     * @param _facetId Identifier of the facet to query.
     * @return version_ Current version of the facet within the active configuration.
     */
    function currentFacetVersion(bytes32 _facetId) internal view returns (uint256 version_) {
        return
            ResolverProxyStorageWrapper.getBusinessLogicResolver().getFacetVersionByConfigurationIdVersionAndFacetId(
                ResolverProxyStorageWrapper.getResolverProxyConfigurationId(),
                ResolverProxyStorageWrapper.getResolverProxyVersion(),
                _facetId
            );
    }

    function _checkFacetsReady(
        IDiamondCutManager.FacetConfiguration[] memory _facetConfigurations,
        uint256 _nextFacetIndex,
        uint256 _facetsLength,
        uint256 _requestedLastFacetIndex
    ) private view returns (bool allReady_, uint256 lastFacetIndex_) {
        lastFacetIndex_ = _requestedLastFacetIndex;
        uint256 facetConfigurationsLength = _facetConfigurations.length;

        for (uint256 facetIndex; facetIndex < facetConfigurationsLength; ) {
            uint256 facetStatus = getFacetVersionStatus(
                _facetConfigurations[facetIndex].id,
                _facetConfigurations[facetIndex].version
            );

            unchecked {
                if (facetStatus != 1) {
                    lastFacetIndex_ = _nextFacetIndex + facetIndex;
                    return (false, lastFacetIndex_);
                }
                ++facetIndex;
            }
        }

        allReady_ = lastFacetIndex_ == _facetsLength;
    }

    /**
     * @notice Diamond-storage accessor that pins `InitializerDataStorage` to a fixed slot,
     *         preventing layout collisions across facets in the same proxy.
     * @dev Uses inline assembly to assign the storage slot; standard ERC-2535 pattern.
     * @return initializer_ Reference to the initializer storage struct.
     */
    // Diamond storage accessor: pins InitializerDataStorage to a fixed slot to avoid layout collisions across facets.
    function initializerStorage() private pure returns (InitializerDataStorage storage initializer_) {
        bytes32 position = STORAGE_LOCATION_INITIALIZER;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            initializer_.slot := position
        }
    }
}
