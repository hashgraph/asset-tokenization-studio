// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IDiamondCut } from "../proxy/IDiamondCut.sol";
import { ResolverProxyUnstructured } from "../proxy/ResolverProxyUnstructured.sol";
import { IBusinessLogicResolver } from "./IBusinessLogicResolver.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { AccessControlStorageWrapper } from "../../domain/core/AccessControlStorageWrapper.sol";
import { ResolverProxyStorageWrapper, ResolverProxyStorage } from "../../domain/core/ResolverProxyStorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";

/**
 * @title DiamondCut
 * @author Asset Tokenization Studio Team
 * @notice Abstract facet that exposes the diamond-cut upgrade surface: version bumps,
 *         configuration-id swaps, and full resolver migrations, all gated behind
 *         `DEFAULT_ADMIN_ROLE`.
 * @dev Inherits `ResolverProxyUnstructured` for ERC-7201 storage access and implements
 *      `IDiamondCut`. Concrete tokens inherit this contract as part of their facet stack.
 */
abstract contract DiamondCut is IDiamondCut, ResolverProxyUnstructured {
    /**
     * @notice Guards a function so only accounts holding `_role` may call it.
     * @param _role The role identifier (bytes32 hash) that the caller must possess.
     */
    modifier onlyRole(bytes32 _role) {
        AccessControlStorageWrapper.checkRole(_role, EvmAccessors.getMsgSender());
        _;
    }

    /// @inheritdoc IDiamondCut
    function updateConfigVersion(uint256 _newVersion) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        ResolverProxyStorageWrapper.getResolver().checkResolverProxyConfigurationRegistered(
            ResolverProxyStorageWrapper.getResolverProxyConfigurationId(),
            _newVersion
        );
        _updateVersion(_newVersion);
    }

    /// @inheritdoc IDiamondCut
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

    /// @inheritdoc IDiamondCut
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

    /// @inheritdoc IDiamondCut
    function getConfigInfo() external view returns (address resolver_, bytes32 configurationId_, uint256 version_) {
        return (
            address(ResolverProxyStorageWrapper.getResolver()),
            ResolverProxyStorageWrapper.getResolverProxyConfigurationId(),
            ResolverProxyStorageWrapper.getVersion()
        );
    }
}
