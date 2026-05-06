// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IDiamondCut } from "../proxy/IDiamondCut.sol";
import { ResolverProxyUnstructured } from "../proxy/ResolverProxyUnstructured.sol";
import { IBusinessLogicResolver } from "./IBusinessLogicResolver.sol";
import { IDiamondCutManager } from "./IDiamondCutManager.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { ResolverProxyStorageWrapper, ResolverProxyStorage } from "../../domain/core/ResolverProxyStorageWrapper.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";
import { CoreModifiers } from "../../services/core/CoreModifiers.sol";

/**
 * @title DiamondCut
 * @author Asset Tokenization Studio Team
 * @notice Abstract contract implementing the diamond upgrade operations: resolver, config, and
 *   version transitions.
 * @dev All mutating operations are gated by `onlyRole(DEFAULT_ADMIN_ROLE)` and `onlyNotPending`
 *   to prevent config changes while a reinitialization is in progress.  Guard logic is inherited
 *   from CoreModifiers — no role or pending checks are defined inline here.
 */
abstract contract DiamondCut is IDiamondCut, ResolverProxyUnstructured, CoreModifiers {
    /// @inheritdoc IDiamondCut
    function updateConfigVersion(uint256 _newVersion) external override onlyRole(DEFAULT_ADMIN_ROLE) onlyNotPending {
        ResolverProxyStorage storage ds = ResolverProxyStorageWrapper.resolverProxyStorage();
        bytes32 configId = ds.resolverProxyConfigurationId;
        ds.resolver.checkResolverProxyConfigurationRegistered(configId, _newVersion);
        _prepareReinitializationIfNeeded(configId, ds.version, configId, _newVersion);
        _updateVersion(ds, _newVersion);
    }

    /// @inheritdoc IDiamondCut
    function updateConfig(
        bytes32 _newConfigurationId,
        uint256 _newVersion
    ) external override onlyRole(DEFAULT_ADMIN_ROLE) onlyNotPending {
        ResolverProxyStorage storage ds = ResolverProxyStorageWrapper.resolverProxyStorage();
        ds.resolver.checkResolverProxyConfigurationRegistered(_newConfigurationId, _newVersion);
        _prepareReinitializationIfNeeded(ds.resolverProxyConfigurationId, ds.version, _newConfigurationId, _newVersion);
        _updateConfigId(ds, _newConfigurationId);
        _updateVersion(ds, _newVersion);
    }

    /// @inheritdoc IDiamondCut
    function updateResolver(
        IBusinessLogicResolver _newResolver,
        bytes32 _newConfigurationId,
        uint256 _newVersion
    ) external override onlyRole(DEFAULT_ADMIN_ROLE) onlyNotPending {
        _newResolver.checkResolverProxyConfigurationRegistered(_newConfigurationId, _newVersion);
        ResolverProxyStorage storage ds = ResolverProxyStorageWrapper.resolverProxyStorage();
        // Resolver change = always fresh deploy on new BLR
        InitializerStorageWrapper._prepareReinitialization(
            bytes32(0),
            0,
            _newConfigurationId,
            _newVersion,
            IDiamondCutManager(address(_newResolver))
        );
        _updateResolver(ds, _newResolver);
        _updateConfigId(ds, _newConfigurationId);
        _updateVersion(ds, _newVersion);
    }

    /// @inheritdoc IDiamondCut
    function getConfigInfo() external view returns (address resolver_, bytes32 configurationId_, uint256 version_) {
        ResolverProxyStorage storage ds = ResolverProxyStorageWrapper.resolverProxyStorage();
        return (address(ds.resolver), ds.resolverProxyConfigurationId, ds.version);
    }

    /**
     * @notice Prepares a reinitialization when the target config or version differs from the current one.
     * @dev No-op when source and target are identical (pure version refresh with no actual change).
     *   Delegates to InitializerStorageWrapper._prepareReinitialization which either marks the proxy
     *   immediately operational (k=0 diff or 0 facets) or sets REINIT_PENDING with a target counter.
     * @param _fromConfigId Current configuration identifier.
     * @param _fromVersion Current version.
     * @param _toConfigId Target configuration identifier.
     * @param _toVersion Target version.
     */
    function _prepareReinitializationIfNeeded(
        bytes32 _fromConfigId,
        uint256 _fromVersion,
        bytes32 _toConfigId,
        uint256 _toVersion
    ) internal {
        // If same config+version, nothing to do
        if (_fromConfigId == _toConfigId && _fromVersion == _toVersion) {
            return;
        }

        InitializerStorageWrapper._prepareReinitialization(
            _fromConfigId,
            _fromVersion,
            _toConfigId,
            _toVersion,
            IDiamondCutManager(address(ResolverProxyStorageWrapper.getBusinessLogicResolver()))
        );
    }
}
