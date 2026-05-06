// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { InitializerStorageWrapper, InitializerDataStorage } from "../../domain/core/InitializerStorageWrapper.sol";
import { ResolverProxyStorageWrapper } from "../../domain/core/ResolverProxyStorageWrapper.sol";
import { IDiamondCutManager } from "../../infrastructure/diamond/IDiamondCutManager.sol";
import { IBusinessLogicResolver } from "../../infrastructure/diamond/IBusinessLogicResolver.sol";
import { IInitializer } from "../../facets/initializer/IInitializer.sol";

/**
 * @title InitializerTestHarness
 * @notice Minimal harness for unit-testing InitializerStorageWrapper in isolation.
 * @dev Exposes internal library functions and provides helpers to seed storage state
 *   without requiring the full diamond infrastructure.  Not for production use.
 */
contract InitializerTestHarness {
    // -------------------------------------------------------------------------
    // Storage seeds (test helpers)
    // -------------------------------------------------------------------------

    /**
     * @notice Seeds the resolver proxy storage so setFacetToReady / setOperationalStatus
     *   can call into a mock BLR without reverting on address(0).
     */
    function setupResolver(address blr) external {
        ResolverProxyStorageWrapper.resolverProxyStorage().resolver = IBusinessLogicResolver(blr);
    }

    /**
     * @notice Sets configTargetCount for (bytes32(0), 0) — the default context used when
     *   ResolverProxyStorage is uninitialised (resolver = address(0), configId = 0, version = 0).
     */
    function setupCounterForDefault(uint256 _target) external {
        InitializerDataStorage storage s = InitializerStorageWrapper.initializerStorage();
        s.configTargetCount[bytes32(0)][0] = _target;
        s.configInitializedCount[bytes32(0)][0] = 0;
        s.configVersionStatus[bytes32(0)][0] = 0;
    }

    /// @notice Forces configVersionStatus to 1 (operational) for any config+version.
    function forceOperational(bytes32 _configId, uint256 _versionId) external {
        InitializerStorageWrapper.initializerStorage().configVersionStatus[_configId][_versionId] = 1;
    }

    /// @notice Forces configVersionStatus to type(uint256).max (REINIT_PENDING) for any config+version.
    function forceReinitPending(bytes32 _configId, uint256 _versionId) external {
        InitializerStorageWrapper.initializerStorage().configVersionStatus[_configId][_versionId] = type(uint256).max;
    }

    // -------------------------------------------------------------------------
    // State-changing wrappers
    // -------------------------------------------------------------------------

    function setFacetToReady(bytes32 _facetId) external {
        InitializerStorageWrapper.setFacetToReady(_facetId);
    }

    function callSetOperationalStatus() external returns (bool isOp_, uint256 lastIdx_) {
        return InitializerStorageWrapper.setOperationalStatus();
    }

    function callPrepareReinitialization(
        bytes32 _fromConfigId,
        uint256 _fromVersion,
        bytes32 _toConfigId,
        uint256 _toVersion,
        IDiamondCutManager _blr
    ) external {
        InitializerStorageWrapper._prepareReinitialization(_fromConfigId, _fromVersion, _toConfigId, _toVersion, _blr);
    }

    // -------------------------------------------------------------------------
    // View wrappers
    // -------------------------------------------------------------------------

    function getInitializedCount(bytes32 _configId, uint256 _versionId) external view returns (uint256) {
        return InitializerStorageWrapper.getConfigInitializedCount(_configId, _versionId);
    }

    function getTargetCount(bytes32 _configId, uint256 _versionId) external view returns (uint256) {
        return InitializerStorageWrapper.getConfigTargetCount(_configId, _versionId);
    }

    function isOperational(bytes32 _configId, uint256 _versionId) external view returns (bool) {
        return InitializerStorageWrapper.getOperationalStatus(_configId, _versionId) == 1;
    }

    function getOperationalStatus(bytes32 _configId, uint256 _versionId) external view returns (uint256) {
        return InitializerStorageWrapper.getOperationalStatus(_configId, _versionId);
    }

    function getLastOperationalVersion() external view returns (uint256) {
        return InitializerStorageWrapper.initializerStorage().lastOperationalVersion;
    }

    function getFacetLastVersion(
        address _resolver,
        bytes32 _configId,
        bytes32 _facetId
    ) external view returns (uint256) {
        return InitializerStorageWrapper.getFacetLastVersion(_resolver, _configId, _facetId);
    }

    function getFacetVersionStatus(
        address _resolver,
        bytes32 _configId,
        bytes32 _facetId,
        uint256 _facetVersion
    ) external view returns (uint256) {
        return InitializerStorageWrapper.getFacetVersionStatus(_resolver, _configId, _facetId, _facetVersion);
    }

    function checkOperational(bytes32 _configId, uint256 _versionId) external view {
        InitializerStorageWrapper.checkOperational(_configId, _versionId);
    }

    function checkFacetNotReady(
        address _resolver,
        bytes32 _configId,
        bytes32 _facetId,
        uint256 _facetVersion
    ) external view {
        InitializerStorageWrapper.checkFacetNotReady(_resolver, _configId, _facetId, _facetVersion);
    }

    function checkFacetNotRegistered(address _resolver, bytes32 _configId, bytes32 _facetId) external view {
        InitializerStorageWrapper.checkFacetNotRegistered(_resolver, _configId, _facetId);
    }

    function checkFacetRegistered(
        address _resolver,
        bytes32 _configId,
        bytes32 _facetId,
        uint256[] calldata _fromLastVersions
    ) external view {
        InitializerStorageWrapper.checkFacetRegistered(_resolver, _configId, _facetId, _fromLastVersions);
    }
}
