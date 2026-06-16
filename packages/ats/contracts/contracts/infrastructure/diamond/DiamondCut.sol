// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IDiamondCut } from "../proxy/IDiamondCut.sol";
import { ResolverProxyUnstructured } from "../proxy/ResolverProxyUnstructured.sol";
import { IBusinessLogicResolver } from "./IBusinessLogicResolver.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { AccessControlStorageWrapper } from "../../domain/core/AccessControlStorageWrapper.sol";
import { ResolverProxyStorageWrapper, ResolverProxyStorage } from "../../domain/core/ResolverProxyStorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { IResolverProxy } from "../proxy/IResolverProxy.sol";

/// @title A title that should describe the contract/interface
/// @author The name of the author
/// @notice Explain to an end user what this does
/// @dev Explain to a developer any extra details";

abstract contract DiamondCut is IDiamondCut, ResolverProxyUnstructured {
    modifier onlyRole(bytes32 _role) {
        AccessControlStorageWrapper.checkRole(_role, EvmAccessors.getMsgSender());
        _;
    }

    function updateConfigVersion(uint256 _newVersion) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        ResolverProxyStorage storage ds = ResolverProxyStorageWrapper.resolverProxyStorage();
        ds.resolver.checkResolverProxyConfigurationRegistered(
            ResolverProxyStorageWrapper.getResolverProxyConfigurationId(),
            _newVersion
        );
        IResolverProxy.ResolverProxyConfigurationV2 memory v2 = ResolverProxyStorageWrapper
            .getResolverProxyConfigurationV2();
        v2.configurationVersion = _newVersion;
        ResolverProxyStorageWrapper.setResolverProxyConfigurationV2(v2);
    }

    function updateConfig(
        bytes32 _newConfigurationId,
        uint256 _newVersion
    ) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        ResolverProxyStorage storage ds = ResolverProxyStorageWrapper.resolverProxyStorage();
        ds.resolver.checkResolverProxyConfigurationRegistered(_newConfigurationId, _newVersion);
        IResolverProxy.ResolverProxyConfigurationV2 memory v2 = ResolverProxyStorageWrapper
            .getResolverProxyConfigurationV2();
        v2.configurationId = _newConfigurationId;
        v2.configurationVersion = _newVersion;
        ResolverProxyStorageWrapper.setResolverProxyConfigurationV2(v2);
    }

    function updateReplacementEnabled(bool _newReplacementEnabled) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        IResolverProxy.ResolverProxyConfigurationV2 memory v2 = ResolverProxyStorageWrapper
            .getResolverProxyConfigurationV2();
        v2.replacementEnabled = _newReplacementEnabled;
        ResolverProxyStorageWrapper.setResolverProxyConfigurationV2(v2);
    }

    function updateResolver(
        IBusinessLogicResolver _newResolver,
        bytes32 _newConfigurationId,
        uint256 _newVersion,
        bool _newReplacementEnabled
    ) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        _newResolver.checkResolverProxyConfigurationRegistered(_newConfigurationId, _newVersion);
        ResolverProxyStorageWrapper.setResolver(_newResolver);
        ResolverProxyStorageWrapper.setResolverProxyConfigurationV2(
            IResolverProxy.ResolverProxyConfigurationV2({
                configurationId: _newConfigurationId,
                configurationVersion: _newVersion,
                replacementEnabled: _newReplacementEnabled
            })
        );
    }

    function getConfigInfo()
        external
        view
        returns (
            address resolver_,
            bytes8 proxyVersion_,
            bytes32 configurationId_,
            uint256 configurationVersion_,
            bool replacementEnabled_
        )
    {
        return (
            address(ResolverProxyStorageWrapper.getBusinessLogicResolver()),
            ResolverProxyStorageWrapper.getResolverProxyVersion(),
            ResolverProxyStorageWrapper.getResolverProxyConfigurationId(),
            ResolverProxyStorageWrapper.getResolverProxyConfigurationVersion(),
            ResolverProxyStorageWrapper.getResolverProxyReplacementEnabled()
        );
    }
}
