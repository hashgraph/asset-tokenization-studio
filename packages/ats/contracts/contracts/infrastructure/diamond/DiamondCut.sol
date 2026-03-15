// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IDiamondCut } from "../proxy/IDiamondCut.sol";
import { ResolverProxyUnstructured } from "../proxy/ResolverProxyUnstructured.sol";
import { IBusinessLogicResolver } from "./IBusinessLogicResolver.sol";
import { _DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { AccessControlStorageWrapper } from "../../domain/core/AccessControlStorageWrapper.sol";
import { ResolverProxyStorageWrapper, ResolverProxyStorage } from "../../domain/core/ResolverProxyStorageWrapper.sol";

abstract contract DiamondCut is IDiamondCut, ResolverProxyUnstructured {
    modifier onlyRole(bytes32 _role) {
        AccessControlStorageWrapper.checkRole(_role, msg.sender);
        _;
    }
    function updateConfigVersion(uint256 _newVersion) external override onlyRole(_DEFAULT_ADMIN_ROLE) {
        ResolverProxyStorage storage ds = ResolverProxyStorageWrapper.resolverProxyStorage();
        ds.resolver.checkResolverProxyConfigurationRegistered(ds.resolverProxyConfigurationId, _newVersion);
        _updateVersion(ds, _newVersion);
    }

    function updateConfig(
        bytes32 _newConfigurationId,
        uint256 _newVersion
    ) external override onlyRole(_DEFAULT_ADMIN_ROLE) {
        ResolverProxyStorage storage ds = ResolverProxyStorageWrapper.resolverProxyStorage();
        ds.resolver.checkResolverProxyConfigurationRegistered(_newConfigurationId, _newVersion);
        _updateConfigId(ds, _newConfigurationId);
        _updateVersion(ds, _newVersion);
    }

    function updateResolver(
        IBusinessLogicResolver _newResolver,
        bytes32 _newConfigurationId,
        uint256 _newVersion
    ) external override onlyRole(_DEFAULT_ADMIN_ROLE) {
        _newResolver.checkResolverProxyConfigurationRegistered(_newConfigurationId, _newVersion);
        ResolverProxyStorage storage ds = ResolverProxyStorageWrapper.resolverProxyStorage();
        _updateResolver(ds, _newResolver);
        _updateConfigId(ds, _newConfigurationId);
        _updateVersion(ds, _newVersion);
    }

    function getConfigInfo() external view returns (address resolver_, bytes32 configurationId_, uint256 version_) {
        ResolverProxyStorage storage ds = ResolverProxyStorageWrapper.resolverProxyStorage();
        return (address(ds.resolver), ds.resolverProxyConfigurationId, ds.version);
    }
}
