// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _INITIALIZER_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { MAX_FACETS_PER_CONFIG } from "../../constants/values.sol";
import { ResolverProxyStorageWrapper } from "./ResolverProxyStorageWrapper.sol";
import { IDiamondCutManager } from "../../infrastructure/diamond/IDiamondCutManager.sol";
import { IBusinessLogicResolver } from "../../infrastructure/diamond/IBusinessLogicResolver.sol";
import { Pagination } from "../../infrastructure/utils/Pagination.sol";
import { IInitializer } from "../../facets/initializer/IInitializer.sol";

/**
 * @notice Tracks per-config, per-facet readiness state for diamond-initialisation flows.
 * @dev Status encoding:
 *   configVersionStatus: 0 = not started, 1 = fully operational.
 *   facetVersionStatus:  1 means the facet version is ready.
 */
struct InitializerDataStorage {
    /// @notice Operational readiness per (configId, versionId).
    /// @dev 0 = not started, 1 = fully operational.
    mapping(bytes32 configId => mapping(uint256 versionId => uint256 status)) configVersionStatus;
    /// @notice Per-facet readiness per version.
    /// @dev 1 means the facet version is ready.
    mapping(bytes32 facetId => mapping(uint256 versionId => uint256 status)) facetVersionStatus;
    /// @notice Latest registered version for each facet.
    mapping(bytes32 facetId => uint256 version) facetLastVersion;
}

/**
 * @title InitializerStorageWrapper
 * @author Asset Tokenization Studio Team
 * @notice Library managing facet-initialisation readiness in a diamond-structured token.
 * @dev Operates on diamond-stored InitializerDataStorage.  Processes all facets in a single
 *   pass — no batching.  Functions are kept internal so they can be reused by multiple
 *   initialiser facets without duplicating storage logic.
 */
library InitializerStorageWrapper {
    /**
     * @notice Checks every facet of the current config+version and marks the asset as
     *   operational when all are ready.
     * @dev Processes ALL facets in a single pass.  No batching, no resume logic.
     *   Reverts when a reinitialisation is pending (the counter path handles activation).
     * @param pageSize Number of facets to process in a single call.
     * @return configId The identifier of the configuration processed.
     * @return version The version of the configuration processed.
     * @return finished Whether all facets have been processed and the asset is operational.
     */
    function setOperationalStatus(
        uint256 pageSize
    ) internal returns (bytes32 configId, uint256 version, bool finished) {
        InitializerDataStorage storage s = initializerStorage();

        configId = ResolverProxyStorageWrapper.getResolverProxyConfigurationId();
        version = ResolverProxyStorageWrapper.getResolverProxyVersion();
        uint256 facetIndex = s.configVersionStatus[configId][version];

        // Already fully operational — nothing to do.
        if (facetIndex == 1) {
            return (configId, version, true);
        }

        IBusinessLogicResolver blr = ResolverProxyStorageWrapper.getBusinessLogicResolver();

        IDiamondCutManager.FacetConfiguration[] memory facetConfigurations = blr
            .getFacetConfigurationsByConfigurationIdAndVersion(configId, version, 0, MAX_FACETS_PER_CONFIG);

        uint256 facetsLength = facetConfigurations.length;
        uint256 lastInPage;
        unchecked {
            lastInPage = facetIndex + Pagination.getSize(facetIndex, facetIndex + pageSize, facetsLength);
        }
        finished = facetsLength == lastInPage;

        // D1-A: auto-approve stateless facets (facetLastVersion == 0).
        // Only block the transition when a facet has been explicitly initialised (lastVersion > 0)
        // but is not yet marked ready (facetVersionStatus != 1).
        for (uint256 i = facetIndex; i < lastInPage; ) {
            bytes32 facetId = facetConfigurations[i].id;
            if (
                s.facetVersionStatus[facetId][facetConfigurations[i].version] != 1 && s.facetLastVersion[facetId] != 0
            ) {
                unchecked {
                    revert IInitializer.NotOperational(configId, version, facetId);
                }
            }
            unchecked {
                ++i;
            }
        }
        s.configVersionStatus[configId][version] = finished ? 1 : lastInPage;
    }

    /**
     * @notice Marks a facet as ready and records its latest version.
     * @dev Resolves the BLR version once and writes both status and last-version in a single
     *   resolution, halving the storage reads and external calls vs. calling setFacetStatus +
     *   setFacetLastVersion independently.
     * @param _facetId Identifier of the facet to ready.
     */
    function setFacetToReady(bytes32 _facetId) internal {
        uint256 version = _currentFacetVersion(_facetId);
        setFacetStatusForVersion(_facetId, version, 1);
        setFacetLastVersionTo(_facetId, version);
    }

    /**
     * @notice Sets the readiness status of a facet for a specific version.
     * @dev Direct storage write without BLR resolution; caller must supply the correct version.
     * @param _facetId Identifier of the facet.
     * @param _versionId Facet implementation version to update.
     * @param _status Status value (1 = ready).
     */
    function setFacetStatusForVersion(bytes32 _facetId, uint256 _versionId, uint256 _status) internal {
        initializerStorage().facetVersionStatus[_facetId][_versionId] = _status;
    }

    /**
     * @notice Records the latest version for a facet.
     * @dev Direct storage write without BLR resolution; caller must supply the correct version.
     * @param _facetId Identifier of the facet.
     * @param _versionId Facet implementation version to record.
     */
    function setFacetLastVersionTo(bytes32 _facetId, uint256 _versionId) internal {
        initializerStorage().facetLastVersion[_facetId] = _versionId;
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
     * @dev See checkFacetNotReady(bytes32,uint256) for the core logic.
     * @param _facetId Identifier of the facet to check.
     */
    function checkFacetNotReady(bytes32 _facetId) internal view {
        checkFacetNotReady(_facetId, _currentFacetVersion(_facetId));
    }

    /**
     * @notice Reverts if the facet version is already marked ready.
     * @param _facetId Identifier of the facet.
     * @param _versionId Facet version to check.
     */
    function checkFacetNotReady(bytes32 _facetId, uint256 _versionId) internal view {
        if (getFacetVersionStatus(_facetId, _versionId) == 1) {
            revert IInitializer.FacetReady(_facetId, _versionId);
        }
    }

    /**
     * @notice Reverts unless the facet's last registered version is in the accepted list.
     * @dev Used on upgrade initialisers to enforce a known upgrade path.
     * @param _facetId Identifier of the facet.
     * @param _fromLastVersions Accepted previous versions; an empty array rejects all.
     */
    function checkFacetRegistered(bytes32 _facetId, uint256[] calldata _fromLastVersions) internal view {
        uint256 i;

        uint256 lastVersion = getFacetLastVersion(_facetId);
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
     * @notice Reverts if the facet has already been registered (last version != 0).
     * @dev Used on fresh initialisers to prevent double-initialisation.
     * @param _facetId Identifier of the facet.
     */
    function checkFacetNotRegistered(bytes32 _facetId) internal view {
        uint256 lastFacetVersion = getFacetLastVersion(_facetId);
        if (lastFacetVersion != 0) {
            revert IInitializer.FacetAlreadyRegistered(_facetId, lastFacetVersion);
        }
    }

    /**
     * @notice Returns the operational status for a given config+version.
     * @param _configId Configuration identifier.
     * @param _versionId Version to query.
     * @return status_ 0 = not started, 1 = fully operational.
     */
    function getOperationalStatus(bytes32 _configId, uint256 _versionId) internal view returns (uint256 status_) {
        return initializerStorage().configVersionStatus[_configId][_versionId];
    }

    /**
     * @notice Returns the readiness status of a specific facet version.
     * @param _facetId Identifier of the facet.
     * @param _versionId Facet implementation version to query.
     * @return status_ 1 if the facet version is ready.
     */
    function getFacetVersionStatus(bytes32 _facetId, uint256 _versionId) internal view returns (uint256 status_) {
        return initializerStorage().facetVersionStatus[_facetId][_versionId];
    }

    /**
     * @notice Returns the latest registered version for a facet.
     * @param _facetId Identifier of the facet.
     * @return lastVersion_ Latest registered version; 0 if never registered.
     */
    function getFacetLastVersion(bytes32 _facetId) internal view returns (uint256 lastVersion_) {
        return initializerStorage().facetLastVersion[_facetId];
    }

    /**
     * @notice Reverts unless the given config+version is fully operational.
     * @dev Calls getOperationalStatus and reverts with AssetNotOperational when status != 1.
     * @param configId Configuration identifier.
     * @param versionId Version to check.
     */
    function checkOperational(bytes32 configId, uint256 versionId) private view {
        if (getOperationalStatus(configId, versionId) != 1) {
            revert IInitializer.AssetNotOperational(configId, versionId);
        }
    }

    /**
     * @notice Resolves the current BLR version for a facet using the active config+version.
     * @dev Single entry point for the repeated three-getter + external-call pattern, avoiding
     *   duplicated bytecode across setFacetStatus, setFacetLastVersion, and checkFacetNotReady.
     * @param _facetId Identifier of the facet.
     * @return version_ Facet implementation version in the current config+version context.
     */
    function _currentFacetVersion(bytes32 _facetId) private view returns (uint256 version_) {
        return
            ResolverProxyStorageWrapper.getBusinessLogicResolver().getFacetVersionByConfigurationIdVersionAndFacetId(
                ResolverProxyStorageWrapper.getResolverProxyConfigurationId(),
                ResolverProxyStorageWrapper.getResolverProxyVersion(),
                _facetId
            );
    }

    /**
     * @notice Diamond storage accessor for InitializerDataStorage.
     * @dev Pins the struct to a fixed slot to avoid layout collisions across facets.
     * @return initializer_ Storage pointer to InitializerDataStorage.
     */
    function initializerStorage() private pure returns (InitializerDataStorage storage initializer_) {
        bytes32 position = _INITIALIZER_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            initializer_.slot := position
        }
    }
}
