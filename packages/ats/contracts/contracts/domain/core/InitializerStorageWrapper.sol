// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _INITIALIZER_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { ResolverProxyStorageWrapper } from "./ResolverProxyStorageWrapper.sol";
import { MAX_INITIALIZER_FACET_INDEX } from "../../constants/values.sol";
import { IDiamondCutManager } from "../../infrastructure/diamond/IDiamondCutManager.sol";

struct InitializerDataStorage {
    // configVersionStatus encoding: 0 = not started, 1 = fully operational, >1 = (resume facet index + 1)
    mapping(bytes32 configId => mapping(uint256 versionId => uint256 status)) configVersionStatus;
    // facetVersionStatus: 1 means the facet version is ready
    mapping(bytes32 facetId => mapping(uint256 versionId => uint256 status)) facetVersionStatus;
    mapping(bytes32 facetId => uint256 version) facetLastVersion;
}

library InitializerStorageWrapper {
    // Verifies that every facet of the current config+version is ready, in batches of MAX_INITIALIZER_FACET_INDEX.
    // Persists progress so next calls resume where the previous one stopped, until the whole config is operational.
    function setOperationalStatus() internal returns (bool isOperational_, uint256 lastFacetIndex_) {
        bytes32 configId = ResolverProxyStorageWrapper.getResolverProxyConfigurationId();
        uint256 versionId = ResolverProxyStorageWrapper.getResolverProxyVersion();

        uint256 operationStatus = getOperationalStatus(configId, versionId);

        // Already fully operational — nothing to do.
        if (operationStatus == 1) {
            return (true, 0);
        }

        // Resume from previously stored progress (status > 1 encodes "resume index + 1"); 0 means start fresh.
        uint256 nextFacetIndex = 0;

        if (operationStatus > 1) {
            nextFacetIndex = operationStatus - 1;
        }

        InitializerDataStorage storage initStorage = initializerStorage();

        // Upper bound of this batch; clamped below to the actual facet count.
        lastFacetIndex_ = MAX_INITIALIZER_FACET_INDEX + nextFacetIndex;

        uint256 facetsLength = ResolverProxyStorageWrapper
            .getBusinessLogicResolver()
            .getFacetsLengthByConfigurationIdAndVersion(configId, versionId);

        if (facetsLength < lastFacetIndex_) {
            lastFacetIndex_ = facetsLength;
        }

        IDiamondCutManager.FacetConfiguration[] memory facetConfigurations = ResolverProxyStorageWrapper
            .getBusinessLogicResolver()
            .getFacetConfigurationsByConfigurationIdAndVersion(configId, versionId, nextFacetIndex, lastFacetIndex_);

        // Walk the batch; stop at the first facet that is not ready and record where to resume next call.
        for (uint256 facetIndex = 0; facetIndex < facetConfigurations.length; facetIndex++) {
            bytes32 facetId = facetConfigurations[facetIndex].id;
            uint256 facetVersion = facetConfigurations[facetIndex].version;

            uint256 facetStatus = getFacetVersionStatus(facetId, facetVersion);

            if (facetStatus != 1) {
                isOperational_ = false;
                lastFacetIndex_ = nextFacetIndex + facetIndex;
                break;
            }
        }

        if (lastFacetIndex_ == facetsLength) {
            // Reached the end with no failures — mark the config fully operational.
            isOperational_ = true;
            initStorage.configVersionStatus[configId][versionId] = 1;
        } else if (lastFacetIndex_ > 0) {
            // Partial progress — store (resume index + 1) so the next call picks up here.
            initStorage.configVersionStatus[configId][versionId] = lastFacetIndex_ + 1;
        }
    }

    function setFacetStatus(bytes32 _facetId, uint256 _status) internal {
        uint256 versionId = ResolverProxyStorageWrapper
            .getBusinessLogicResolver()
            .getFacetVersionByConfigurationIdVersionAndFacetId(
                ResolverProxyStorageWrapper.getResolverProxyConfigurationId(),
                ResolverProxyStorageWrapper.getResolverProxyVersion(),
                _facetId
            );
        initializerStorage().facetVersionStatus[_facetId][versionId] = _status;
    }

    function setFacetLastVersion(bytes32 _facetId) internal {
        uint256 versionId = ResolverProxyStorageWrapper
            .getBusinessLogicResolver()
            .getFacetVersionByConfigurationIdVersionAndFacetId(
                ResolverProxyStorageWrapper.getResolverProxyConfigurationId(),
                ResolverProxyStorageWrapper.getResolverProxyVersion(),
                _facetId
            );
        initializerStorage().facetLastVersion[_facetId] = versionId;
    }

    function checkOperational(bytes32 configId, uint256 versionId) internal view {
        if (getOperationalStatus(configId, versionId) != 1) {
            revert("Asset not operational");
        }
    }
    function checkNonOperational(bytes32 configId, uint256 versionId) internal view {
        if (getOperationalStatus(configId, versionId) == 1) {
            revert("Asset operational");
        }
    }
    function checkFacetNotReady(bytes32 _facetId, uint256 _versionId) internal view {
        if (getFacetVersionStatus(_facetId, _versionId) == 1) {
            revert("Facet is ready");
        }
    }

    function getOperationalStatus(bytes32 _configId, uint256 _versionId) internal view returns (uint256 status_) {
        return initializerStorage().configVersionStatus[_configId][_versionId];
    }
    function getFacetVersionStatus(bytes32 _facetId, uint256 _versionId) internal view returns (uint256 status_) {
        return initializerStorage().facetVersionStatus[_facetId][_versionId];
    }
    function getFacetLastVersion(bytes32 _facetId) internal view returns (uint256 lastVersion_) {
        return initializerStorage().facetLastVersion[_facetId];
    }

    // Diamond storage accessor: pins InitializerDataStorage to a fixed slot to avoid layout collisions across facets.
    function initializerStorage() internal pure returns (InitializerDataStorage storage initializer_) {
        bytes32 position = _INITIALIZER_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            initializer_.slot := position
        }
    }
}
