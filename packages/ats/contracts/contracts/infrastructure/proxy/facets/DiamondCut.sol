// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IDiamondCut } from "../../interfaces/IDiamondCut.sol";
import { ResolverProxyUnstructured } from "../ResolverProxyUnstructured.sol";
import { IBusinessLogicResolver } from "../../interfaces/IBusinessLogicResolver.sol";
import { ResolverProxyStorage, resolverProxyStorage } from "../../../storage/ExternalStorageAccessor.sol";
import { LibAccess } from "../../../lib/core/LibAccess.sol";

bytes32 constant _DEFAULT_ADMIN_ROLE = bytes32(0);

abstract contract DiamondCut is IDiamondCut, ResolverProxyUnstructured {
    function updateConfigVersion(uint256 _newVersion) external override {
        LibAccess.checkRole(_DEFAULT_ADMIN_ROLE);
        ResolverProxyStorage storage ds = resolverProxyStorage();
        ds.resolver.checkResolverProxyConfigurationRegistered(ds.resolverProxyConfigurationId, _newVersion);
        _updateVersion(ds, _newVersion);
    }

    function updateConfig(bytes32 _newConfigurationId, uint256 _newVersion) external override {
        LibAccess.checkRole(_DEFAULT_ADMIN_ROLE);
        ResolverProxyStorage storage ds = resolverProxyStorage();
        ds.resolver.checkResolverProxyConfigurationRegistered(_newConfigurationId, _newVersion);
        _updateConfigId(ds, _newConfigurationId);
        _updateVersion(ds, _newVersion);
    }

    function updateResolver(
        IBusinessLogicResolver _newResolver,
        bytes32 _newConfigurationId,
        uint256 _newVersion
    ) external override {
        LibAccess.checkRole(_DEFAULT_ADMIN_ROLE);
        _newResolver.checkResolverProxyConfigurationRegistered(_newConfigurationId, _newVersion);
        ResolverProxyStorage storage ds = resolverProxyStorage();
        _updateResolver(ds, _newResolver);
        _updateConfigId(ds, _newConfigurationId);
        _updateVersion(ds, _newVersion);
    }

    function getConfigInfo() external view returns (address resolver_, bytes32 configurationId_, uint256 version_) {
        ResolverProxyStorage storage ds = resolverProxyStorage();
        return (address(ds.resolver), ds.resolverProxyConfigurationId, ds.version);
    }
}
