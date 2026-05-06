// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _INITIALIZER_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { ResolverProxyStorageWrapper } from "./ResolverProxyStorageWrapper.sol";
import { MAX_INITIALIZER_FACET_INDEX } from "../../constants/values.sol";
import { IDiamondCutManager } from "../../infrastructure/diamond/IDiamondCutManager.sol";
import { IInitializer } from "../../facets/initializer/IInitializer.sol";

/**
 * @notice Tracks per-config and per-facet readiness state for diamond-initialisation flows.
 * @dev Uses diamond storage to avoid layout collisions.  Status encoding:
 *   configVersionStatus: 0 = not started, 1 = fully operational, >1 = resume index + 1.
 *   facetVersionStatus:  1 means the facet version is ready.
 */
struct InitializerDataStorage {
    /// @notice Operational readiness per (configId, versionId).
    /// @dev 0 = not started, 1 = fully operational, >1 = (resume facet index + 1).
    mapping(bytes32 configId => mapping(uint256 versionId => uint256 status)) configVersionStatus;
    /// @notice Per-facet readiness status.
    /// @dev Composite key = keccak256(resolver, configId, facetId, facetVersion). 1 means ready.
    mapping(bytes32 facetStateKey => uint256 status) facetVersionStatus;
    /// @notice Latest registered version for each facet context.
    /// @dev Composite key = keccak256(resolver, configId, facetId).
    mapping(bytes32 facetContextKey => uint256 version) facetLastVersion;
    /// @notice How many facets have already called setFacetToReady for a config+version.
    mapping(bytes32 configId => mapping(uint256 versionId => uint256 count)) configInitializedCount;
    /// @notice Expected number of facets to register before the config auto-transitions to operational.
    /// @dev 0 means the counter mechanism is not configured for this config+version.
    mapping(bytes32 configId => mapping(uint256 versionId => uint256 target)) configTargetCount;
    /// @notice Version last emitted as TokenOperational. Used as fromVersion in diff queries.
    uint256 lastOperationalVersion;
}

/**
 * @title InitializerStorageWrapper
 * @author Asset Tokenization Studio Team
 * @notice Library for managing facet-initialisation readiness in a diamond-structured token.
 * @dev Operates on diamond-stored InitializerDataStorage.  All functions are internal so
 *   they can be reused by multiple initialiser facets without duplicating storage logic.
 *   Batched operational-status checks prevent out-of-gas failures during large configs.
 */
library InitializerStorageWrapper {
    uint256 private constant _REINIT_PENDING = type(uint256).max;

    // -------------------------------------------------------------------------
    // Internal — state-changing
    // -------------------------------------------------------------------------

    /**
     * @notice Marks a facet as ready, records its latest version, and attempts auto-activation.
     * @dev If a target count was configured via _prepareReinitialization, the counter increments on
     *   every call.  When the counter reaches the target the config transitions to operational
     *   atomically and TokenOperational is emitted — no separate setOperationalStatus call needed.
     * @param _facetId Identifier of the facet to ready.
     */
    function setFacetToReady(bytes32 _facetId) internal {
        IDiamondCutManager blr = ResolverProxyStorageWrapper.getBusinessLogicResolver();
        bytes32 configId = ResolverProxyStorageWrapper.getResolverProxyConfigurationId();
        uint256 versionId = ResolverProxyStorageWrapper.getResolverProxyVersion();

        uint256 facetVersionId = blr.getFacetVersionByConfigurationIdVersionAndFacetId(configId, versionId, _facetId);

        bytes32 facetStateKey = _buildFacetStateKey(address(blr), configId, _facetId, facetVersionId);
        bytes32 facetContextKey = _buildFacetContextKey(address(blr), configId, _facetId);

        InitializerDataStorage storage s = initializerStorage();
        s.facetVersionStatus[facetStateKey] = 1;
        s.facetLastVersion[facetContextKey] = facetVersionId;
        _tryAutoActivate();
    }

    /**
     * @notice Prepares the asset for re-initialization by querying the BLR diff and setting the counter.
     * @param _fromConfigId Source configuration identifier.
     * @param _fromVersion Source version.
     * @param _toConfigId Target configuration identifier.
     * @param _toVersion Target version.
     * @param _blr The Business Logic Resolver (IDiamondCutManager).
     */
    function _prepareReinitialization(
        bytes32 _fromConfigId,
        uint256 _fromVersion,
        bytes32 _toConfigId,
        uint256 _toVersion,
        IDiamondCutManager _blr
    ) internal {
        InitializerDataStorage storage s = initializerStorage();

        // Fresh deploy: all facets need initialization
        if (_isFreshDeploy(_fromConfigId, _fromVersion)) {
            return _handleFreshDeploy(s, _toConfigId, _toVersion, _blr);
        }

        (uint256 totalFacets_, uint256 unchangedFacets_, bool isRegistered_) = _blr.getTransitionDiff(
            _fromConfigId,
            _fromVersion,
            _toConfigId,
            _toVersion
        );

        if (!isRegistered_) {
            revert IInitializer.TransitionDiffNotRegistered(_fromConfigId, _fromVersion, _toConfigId, _toVersion);
        }

        if (s.configVersionStatus[_toConfigId][_toVersion] == _REINIT_PENDING) {
            revert IInitializer.AlreadyPendingReinitialization(_toConfigId, _toVersion);
        }

        uint256 changedFacets_;
        unchecked {
            changedFacets_ = totalFacets_ - unchangedFacets_;
        }
        if (changedFacets_ == 0) {
            s.lastOperationalVersion = _toVersion;
            s.configVersionStatus[_toConfigId][_toVersion] = 1;
            emit IInitializer.TokenOperational(_toConfigId, _toVersion);
            return;
        }
        s.configTargetCount[_toConfigId][_toVersion] = changedFacets_;
        s.configInitializedCount[_toConfigId][_toVersion] = 0;
        s.configVersionStatus[_toConfigId][_toVersion] = _REINIT_PENDING;
    }

    /**
     * @notice Checks every facet in the current config+version is ready, in batches.
     * @dev Batching avoids out-of-gas failures when a config holds many facets.
     *   Persists progress as (lastFacetIndex + 1) so the next call resumes.
     *   Reverts when a reinitialization is pending — the counter path handles activation.
     * @return isOperational_ True only when all facets are ready.
     * @return lastFacetIndex_ Index of the last facet checked; equals facetsLength when done.
     */
    function setOperationalStatus() internal returns (bool isOperational_, uint256 lastFacetIndex_) {
        bytes32 configId = ResolverProxyStorageWrapper.getResolverProxyConfigurationId();
        uint256 versionId = ResolverProxyStorageWrapper.getResolverProxyVersion();

        // Revert if a reinitialization is pending — the counter path handles activation.
        checkNotPending(configId, versionId);

        // Already fully operational — nothing to do.
        if (getOperationalStatus(configId, versionId) == 1) {
            return (true, 0);
        }

        uint256 operationStatus = getOperationalStatus(configId, versionId);
        // Resume from previously stored progress (status > 1 encodes "resume index + 1"); 0 means start fresh.
        uint256 nextFacetIndex;
        unchecked {
            nextFacetIndex = operationStatus > 1 ? operationStatus - 1 : 0;
        }
        lastFacetIndex_ = nextFacetIndex + MAX_INITIALIZER_FACET_INDEX;

        uint256 facetsLength = ResolverProxyStorageWrapper
            .getBusinessLogicResolver()
            .getFacetsLengthByConfigurationIdAndVersion(configId, versionId);

        if (facetsLength < lastFacetIndex_) {
            lastFacetIndex_ = facetsLength;
        }

        bool complete_;
        (complete_, lastFacetIndex_) = _processBatch(configId, versionId, nextFacetIndex, lastFacetIndex_);

        InitializerDataStorage storage initStorage = initializerStorage();
        if (complete_) {
            initStorage.configVersionStatus[configId][versionId] = 1;
            return (true, lastFacetIndex_);
        }
        if (lastFacetIndex_ > 0) {
            // Partial progress — store (resume index + 1) so the next call picks up here.
            unchecked {
                initStorage.configVersionStatus[configId][versionId] = lastFacetIndex_ + 1;
            }
        }
    }

    // -------------------------------------------------------------------------
    // Internal — view
    // -------------------------------------------------------------------------

    /**
     * @notice Reverts unless the given config+version is fully operational.
     * @param _configId Configuration identifier.
     * @param _versionId Version to check.
     */
    function checkOperational(bytes32 _configId, uint256 _versionId) internal view {
        if (getOperationalStatus(_configId, _versionId) != 1) {
            revert IInitializer.AssetNotOperational(_configId, _versionId);
        }
    }

    /**
     * @notice Reverts if a reinitialization is currently pending for the given config+version.
     * @dev Distinct from checkOperational: allows status 0 (not yet started) but blocks
     *   management operations (updateConfig, updateConfigVersion, updateResolver) while
     *   facets are mid-initialization.
     * @param _configId Configuration identifier.
     * @param _versionId Version to check.
     */
    function checkNotPending(bytes32 _configId, uint256 _versionId) internal view {
        if (getOperationalStatus(_configId, _versionId) == _REINIT_PENDING) {
            revert IInitializer.StillPending(_configId, _versionId);
        }
    }

    /**
     * @notice Reverts if the facet version is already ready.
     * @param _resolver Current BLR address.
     * @param _configId Configuration identifier.
     * @param _facetId Identifier of the facet.
     * @param _facetVersion Version to check.
     */
    function checkFacetNotReady(
        address _resolver,
        bytes32 _configId,
        bytes32 _facetId,
        uint256 _facetVersion
    ) internal view {
        if (
            initializerStorage().facetVersionStatus[
                _buildFacetStateKey(_resolver, _configId, _facetId, _facetVersion)
            ] == 1
        ) {
            revert IInitializer.FacetReady(_facetId, _facetVersion);
        }
    }

    /**
     * @notice Reverts if the facet was not previously registered with any of the supplied versions.
     * @param _resolver Current BLR address.
     * @param _configId Configuration identifier.
     * @param _facetId Identifier of the facet.
     * @param _fromLastVersions Expected previous versions.
     */
    function checkFacetRegistered(
        address _resolver,
        bytes32 _configId,
        bytes32 _facetId,
        uint256[] calldata _fromLastVersions
    ) internal view {
        uint256 lastVersion = initializerStorage().facetLastVersion[
            _buildFacetContextKey(_resolver, _configId, _facetId)
        ];
        bool found;
        uint256 length = _fromLastVersions.length;
        for (uint256 index; index < length; ) {
            if (lastVersion == _fromLastVersions[index]) {
                found = true;
                break;
            }
            unchecked {
                ++index;
            }
        }
        if (!found) {
            revert IInitializer.FacetPreviousVersionNotAccepted(_facetId, lastVersion, _fromLastVersions);
        }
    }

    /**
     * @notice Reverts if the facet has already been registered (last version != 0).
     * @param _resolver Current BLR address.
     * @param _configId Configuration identifier.
     * @param _facetId Identifier of the facet.
     */
    function checkFacetNotRegistered(address _resolver, bytes32 _configId, bytes32 _facetId) internal view {
        uint256 lastVersion = initializerStorage().facetLastVersion[
            _buildFacetContextKey(_resolver, _configId, _facetId)
        ];
        if (lastVersion != 0) {
            revert IInitializer.FacetAlreadyRegistered(_facetId, lastVersion);
        }
    }

    /**
     * @notice Returns the operational status for a config+version.
     * @param _configId Configuration identifier.
     * @param _versionId Version to query.
     * @return status_ 0 = not started, 1 = operational, >1 = resume index + 1.
     */
    function getOperationalStatus(bytes32 _configId, uint256 _versionId) internal view returns (uint256 status_) {
        return initializerStorage().configVersionStatus[_configId][_versionId];
    }

    /**
     * @notice Returns the readiness status of a specific facet version.
     * @param _resolver Current BLR address.
     * @param _configId Configuration identifier.
     * @param _facetId Identifier of the facet.
     * @param _facetVersion Version to query.
     * @return status_ 1 if ready.
     */
    function getFacetVersionStatus(
        address _resolver,
        bytes32 _configId,
        bytes32 _facetId,
        uint256 _facetVersion
    ) internal view returns (uint256 status_) {
        return
            initializerStorage().facetVersionStatus[_buildFacetStateKey(_resolver, _configId, _facetId, _facetVersion)];
    }

    /**
     * @notice Returns the latest registered version for a facet in a context.
     * @param _resolver Current BLR address.
     * @param _configId Configuration identifier.
     * @param _facetId Identifier of the facet.
     * @return lastVersion_ 0 if never registered.
     */
    function getFacetLastVersion(
        address _resolver,
        bytes32 _configId,
        bytes32 _facetId
    ) internal view returns (uint256 lastVersion_) {
        return initializerStorage().facetLastVersion[_buildFacetContextKey(_resolver, _configId, _facetId)];
    }

    /**
     * @notice Returns how many facets have called setFacetToReady for a config+version.
     * @param _configId Configuration identifier.
     * @param _versionId Version to query.
     * @return count_ Current counter value.
     */
    function getConfigInitializedCount(bytes32 _configId, uint256 _versionId) internal view returns (uint256 count_) {
        return initializerStorage().configInitializedCount[_configId][_versionId];
    }

    /**
     * @notice Returns the target facet count configured for a config+version.
     * @param _configId Configuration identifier.
     * @param _versionId Version to query.
     * @return count_ Target set by _prepareReinitialization; 0 means counter not configured.
     */
    function getConfigTargetCount(bytes32 _configId, uint256 _versionId) internal view returns (uint256 count_) {
        return initializerStorage().configTargetCount[_configId][_versionId];
    }

    // -------------------------------------------------------------------------
    // Convenience overloads (internal view) — resolve config context from ResolverProxyStorageWrapper
    // -------------------------------------------------------------------------

    /**
     * @notice Convenience overload that resolves the current config+version internally.
     * @dev See checkNotPending(bytes32,uint256) for the core logic.
     */
    function checkNotPending() internal view {
        checkNotPending(
            ResolverProxyStorageWrapper.getResolverProxyConfigurationId(),
            ResolverProxyStorageWrapper.getResolverProxyVersion()
        );
    }

    /**
     * @notice Convenience overload that resolves the current config+version internally.
     * @dev See checkOperational(bytes32,uint256) for the core logic.
     */
    function checkOperational() internal view {
        checkOperational(
            ResolverProxyStorageWrapper.getResolverProxyConfigurationId(),
            ResolverProxyStorageWrapper.getResolverProxyVersion()
        );
    }

    /**
     * @notice Convenience overload that resolves the facet version from the BLR internally.
     * @dev See checkFacetNotReady(address,bytes32,bytes32,uint256) for the core logic.
     * @param _facetId Identifier of the facet to check.
     */
    function checkFacetNotReady(bytes32 _facetId) internal view {
        IDiamondCutManager blr = ResolverProxyStorageWrapper.getBusinessLogicResolver();
        bytes32 configId = ResolverProxyStorageWrapper.getResolverProxyConfigurationId();
        uint256 versionId = ResolverProxyStorageWrapper.getResolverProxyVersion();
        checkFacetNotReady(
            address(blr),
            configId,
            _facetId,
            blr.getFacetVersionByConfigurationIdVersionAndFacetId(configId, versionId, _facetId)
        );
    }

    /**
     * @notice Convenience overload that resolves the BLR address and config internally.
     * @dev See checkFacetRegistered(address,bytes32,bytes32,uint256[] calldata) for core logic.
     * @param _facetId Identifier of the facet to check.
     * @param _fromLastVersions Accepted previous versions.
     */
    function checkFacetRegistered(bytes32 _facetId, uint256[] calldata _fromLastVersions) internal view {
        checkFacetRegistered(
            address(ResolverProxyStorageWrapper.getBusinessLogicResolver()),
            ResolverProxyStorageWrapper.getResolverProxyConfigurationId(),
            _facetId,
            _fromLastVersions
        );
    }

    /**
     * @notice Convenience overload that resolves the BLR address and config internally.
     * @dev See checkFacetNotRegistered(address,bytes32,bytes32) for the core logic.
     * @param _facetId Identifier of the facet to check.
     */
    function checkFacetNotRegistered(bytes32 _facetId) internal view {
        checkFacetNotRegistered(
            address(ResolverProxyStorageWrapper.getBusinessLogicResolver()),
            ResolverProxyStorageWrapper.getResolverProxyConfigurationId(),
            _facetId
        );
    }

    function getLastOperationalVersion() internal view returns (uint256 lastOperationalVersion) {
        lastOperationalVersion = initializerStorage().lastOperationalVersion;
    }
    /**
     * @notice Diamond storage accessor for InitializerDataStorage.
     * @dev Pins the struct to a fixed slot to avoid layout collisions across facets.
     * @return initializer_ Storage pointer to InitializerDataStorage.
     */
    function initializerStorage() internal pure returns (InitializerDataStorage storage initializer_) {
        bytes32 position = _INITIALIZER_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            initializer_.slot := position
        }
    }

    // -------------------------------------------------------------------------
    // Private — state-changing
    // -------------------------------------------------------------------------

    /**
     * @notice Sets up the target counters for a fresh deployment and emits operational when no facets exist.
     * @param s Storage pointer for InitializerDataStorage.
     * @param _toConfigId Target configuration identifier.
     * @param _toVersion Target version.
     * @param _blr The Business Logic Resolver.
     */
    function _handleFreshDeploy(
        InitializerDataStorage storage s,
        bytes32 _toConfigId,
        uint256 _toVersion,
        IDiamondCutManager _blr
    ) private {
        uint256 totalFacets = _blr.getFacetsLengthByConfigurationIdAndVersion(_toConfigId, _toVersion);
        if (totalFacets == 0) {
            s.lastOperationalVersion = _toVersion;
            s.configVersionStatus[_toConfigId][_toVersion] = 1;
            emit IInitializer.TokenOperational(_toConfigId, _toVersion);
            return;
        }
        s.configTargetCount[_toConfigId][_toVersion] = totalFacets;
        s.configInitializedCount[_toConfigId][_toVersion] = 0;
        s.configVersionStatus[_toConfigId][_toVersion] = _REINIT_PENDING;
    }

    /**
     * @dev Increments the per-config counter and transitions to operational when the target is reached.
     *   O(1) gas regardless of total facet count — no iteration needed.
     *   No-op when configTargetCount is 0 (counter mechanism not configured).
     */
    function _tryAutoActivate() private {
        bytes32 configId = ResolverProxyStorageWrapper.getResolverProxyConfigurationId();
        uint256 versionId = ResolverProxyStorageWrapper.getResolverProxyVersion();

        InitializerDataStorage storage s = initializerStorage();

        // Already operational — nothing to do.
        if (s.configVersionStatus[configId][versionId] == 1) return;

        if (s.configTargetCount[configId][versionId] == 0) return;

        uint256 newCount;
        unchecked {
            newCount = s.configInitializedCount[configId][versionId] + 1;
        }
        s.configInitializedCount[configId][versionId] = newCount;

        // newCount increments by 1 per call; equals target exactly when all registered facets are ready.
        if (newCount == s.configTargetCount[configId][versionId]) {
            s.configVersionStatus[configId][versionId] = 1;
            s.lastOperationalVersion = versionId;
            emit IInitializer.TokenOperational(configId, versionId);
        }
    }

    // -------------------------------------------------------------------------
    // Private — view
    // -------------------------------------------------------------------------

    /**
     * @notice Walks a batch of facets and returns whether all are ready.
     * @param configId Active configuration identifier.
     * @param versionId Active version.
     * @param fromIndex Start of the batch (inclusive).
     * @param toIndex End of the batch (exclusive).
     * @return complete_ True when every facet in the range is ready.
     * @return stoppedAt_ The index where the scan stopped; equals toIndex when complete.
     */
    function _processBatch(
        bytes32 configId,
        uint256 versionId,
        uint256 fromIndex,
        uint256 toIndex
    ) private view returns (bool complete_, uint256 stoppedAt_) {
        IDiamondCutManager blr = ResolverProxyStorageWrapper.getBusinessLogicResolver();
        IDiamondCutManager.FacetConfiguration[] memory facetConfigurations = blr
            .getFacetConfigurationsByConfigurationIdAndVersion(configId, versionId, fromIndex, toIndex);

        address resolver = address(blr);
        uint256 length = facetConfigurations.length;
        for (uint256 i; i < length; ) {
            if (
                getFacetVersionStatus(resolver, configId, facetConfigurations[i].id, facetConfigurations[i].version) !=
                1
            ) {
                unchecked {
                    return (false, fromIndex + i);
                }
            }
            unchecked {
                ++i;
            }
        }
        complete_ = true;
        stoppedAt_ = toIndex;
    }

    // -------------------------------------------------------------------------
    // Private — pure
    // -------------------------------------------------------------------------

    /**
     * @notice Returns true when the config+version pair identifies a fresh deployment.
     * @param _fromConfigId Source configuration identifier.
     * @param _fromVersion Source version.
     * @return isFresh_ True when both are zero (no prior config exists).
     */
    function _isFreshDeploy(bytes32 _fromConfigId, uint256 _fromVersion) private pure returns (bool isFresh_) {
        isFresh_ = _fromConfigId == bytes32(0) && _fromVersion == 0;
    }

    /**
     * @notice Computes the composite key for a facet version state.
     * @param _resolver Address of the current BLR/resolver.
     * @param _configId Configuration identifier.
     * @param _facetId Facet identifier.
     * @param _facetVersion Facet implementation version.
     * @return key_ Composite key for facetVersionStatus.
     */
    function _buildFacetStateKey(
        address _resolver,
        bytes32 _configId,
        bytes32 _facetId,
        uint256 _facetVersion
    ) private pure returns (bytes32 key_) {
        key_ = keccak256(abi.encodePacked(_resolver, _configId, _facetId, _facetVersion));
    }

    /**
     * @notice Computes the composite key for a facet context (excludes version).
     * @param _resolver Address of the current BLR/resolver.
     * @param _configId Configuration identifier.
     * @param _facetId Facet identifier.
     * @return key_ Composite key for facetLastVersion.
     */
    function _buildFacetContextKey(
        address _resolver,
        bytes32 _configId,
        bytes32 _facetId
    ) private pure returns (bytes32 key_) {
        key_ = keccak256(abi.encodePacked(_resolver, _configId, _facetId));
    }
}
