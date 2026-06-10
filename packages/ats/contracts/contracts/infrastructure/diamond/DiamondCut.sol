// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IDiamondCut } from "../proxy/IDiamondCut.sol";
import { ResolverProxyUnstructured } from "../proxy/ResolverProxyUnstructured.sol";
import { IBusinessLogicResolver } from "./IBusinessLogicResolver.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { AccessControlStorageWrapper } from "../../domain/core/AccessControlStorageWrapper.sol";
import { ResolverProxyStorageWrapper, ResolverProxyStorage } from "../../domain/core/ResolverProxyStorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";

abstract contract DiamondCut is IDiamondCut, ResolverProxyUnstructured {
    modifier onlyRole(bytes32 _role) {
        AccessControlStorageWrapper.checkRole(_role, EvmAccessors.getMsgSender());
        _;
    }
    function updateConfigVersion(uint256 _newVersion) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        ResolverProxyStorageWrapper.getResolver().checkResolverProxyConfigurationRegistered(
            ResolverProxyStorageWrapper.getResolverProxyConfigurationId(),
            _newVersion
        );
        _updateVersion(_newVersion);
    }

    function updateConfig(
        bytes32 _newConfigurationId,
        uint256 _newVersion
    ) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        ResolverProxyStorageWrapper.getResolver().checkResolverProxyConfigurationRegistered(
            _newConfigurationId,
            _newVersion
        );
        _updateConfigId(_newConfigurationId);
        _updateVersion(_newVersion);
    }

    function updateResolver(
        IBusinessLogicResolver _newResolver,
        bytes32 _newConfigurationId,
        uint256 _newVersion
    ) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        _newResolver.checkResolverProxyConfigurationRegistered(_newConfigurationId, _newVersion);
        _updateResolver(_newResolver);
        _updateConfigId(_newConfigurationId);
        _updateVersion(_newVersion);
    }

    function getConfigInfo() external view returns (address resolver_, bytes32 configurationId_, uint256 version_) {
        return (
            address(ResolverProxyStorageWrapper.getResolver()),
            ResolverProxyStorageWrapper.getResolverProxyConfigurationId(),
            ResolverProxyStorageWrapper.getVersion()
        );
    }
}
