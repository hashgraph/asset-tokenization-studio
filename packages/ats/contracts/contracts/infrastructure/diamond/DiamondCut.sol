// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IDiamondCut } from "../proxy/IDiamondCut.sol";
import { ResolverProxyUnstructured } from "../proxy/ResolverProxyUnstructured.sol";
import { IBusinessLogicResolver } from "./IBusinessLogicResolver.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { AccessControlStorageWrapper } from "../../domain/core/AccessControlStorageWrapper.sol";
import { ResolverProxyStorageWrapper } from "../../domain/core/ResolverProxyStorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";

/**
 * @title Diamond Cut
 * @notice Provides privileged resolver-proxy configuration update operations.
 * @dev Mutates resolver-proxy storage after validating target configurations through the
 *      configured or supplied business-logic resolver. Access is restricted to accounts holding
 *      the default admin role in the proxy access-control storage.
 * @author Asset Tokenization Studio Team
 */
abstract contract DiamondCut is IDiamondCut, ResolverProxyUnstructured {
    /**
     * @notice Restricts execution to accounts holding a required role.
     * @dev Uses the effective EVM sender from `EvmAccessors` and reverts through access-control
     *      storage when the sender is not authorised.
     * @param _role Role identifier required to execute the guarded function.
     */
    modifier onlyRole(bytes32 _role) {
        AccessControlStorageWrapper.checkRole(_role, EvmAccessors.getMsgSender());
        _;
    }

    /// @inheritdoc IDiamondCut
    /// @dev Requires `DEFAULT_ADMIN_ROLE` and preserves the active configuration identifier and
    ///      resolver while updating only the pinned configuration version.
    function updateConfigVersion(uint256 _newVersion) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        ResolverProxyStorageWrapper.getBusinessLogicResolver().checkResolverProxyConfigurationRegistered(
            ResolverProxyStorageWrapper.getResolverProxyConfigurationId(),
            _newVersion
        );
        _updateVersion(_newVersion);
    }

    /// @inheritdoc IDiamondCut
    /// @dev Requires `DEFAULT_ADMIN_ROLE` and validates the configuration before storing the new
    ///      configuration identifier and pinned version.
    function updateConfig(
        bytes32 _newConfigurationId,
        uint256 _newVersion
    ) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        ResolverProxyStorageWrapper.getBusinessLogicResolver().checkResolverProxyConfigurationRegistered(
            _newConfigurationId,
            _newVersion
        );
        _updateConfigId(_newConfigurationId);
        _updateVersion(_newVersion);
    }

    /// @inheritdoc IDiamondCut
    /// @dev Requires `DEFAULT_ADMIN_ROLE` and validates the target configuration against the new
    ///      resolver before replacing the resolver pointer, configuration identifier and version.
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
    function getConfigInfo()
        external
        view
        override
        returns (address resolver_, bytes32 configurationId_, uint256 version_)
    {
        return (
            address(ResolverProxyStorageWrapper.getBusinessLogicResolver()),
            ResolverProxyStorageWrapper.getResolverProxyConfigurationId(),
            ResolverProxyStorageWrapper.getResolverProxyVersion()
        );
    }
}
