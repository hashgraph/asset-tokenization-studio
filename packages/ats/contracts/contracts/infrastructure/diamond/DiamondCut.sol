// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IDiamondCut } from "../proxy/IDiamondCut.sol";
import { ResolverProxyUnstructured } from "../proxy/ResolverProxyUnstructured.sol";
import { IBusinessLogicResolver } from "./IBusinessLogicResolver.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { AccessControlStorageWrapper } from "../../domain/core/AccessControlStorageWrapper.sol";
import { ResolverProxyStorageWrapper } from "../../domain/core/ResolverProxyStorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { IResolverProxy } from "../proxy/IResolverProxy.sol";

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

    /// @notice Restricts execution to a candidate resolver that is neither the zero address nor
    ///         fails an explicit `isBusinessLogicResolver()` identity check.
    /// @dev The identity check is performed through a low-level `call()`, not a direct interface
    ///      call, so a non-conforming target reverts with `InvalidBusinessLogicResolver` instead of
    ///      an unrelated low-level revert.
    /// @param _resolver Candidate resolver address to validate.
    modifier onlyValidBusinessLogicResolver(IBusinessLogicResolver _resolver) {
        if (address(_resolver) == address(0)) revert InvalidBusinessLogicResolver(address(_resolver));
        (bool success, bytes memory returnData) = address(_resolver).call(
            abi.encodeWithSelector(IBusinessLogicResolver.isBusinessLogicResolver.selector)
        );
        if (!success || returnData.length < 32 || !abi.decode(returnData, (bool))) {
            revert InvalidBusinessLogicResolver(address(_resolver));
        }
        _;
    }

    /// @inheritdoc IDiamondCut
    /// @dev Requires `DEFAULT_ADMIN_ROLE` and preserves the active configuration identifier and
    ///      resolver while updating only the pinned configuration version.
    function updateConfigVersion(
        uint256 _newVersion
    )
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyRegisteredResolverProxyConfiguration(
            ResolverProxyStorageWrapper.getBusinessLogicResolver(),
            ResolverProxyStorageWrapper.getResolverProxyConfigurationId(),
            _newVersion
        )
    {
        uint256 oldVersion = ResolverProxyStorageWrapper.getResolverProxyConfigurationVersion();
        IResolverProxy.ResolverProxyConfigurationV2 memory v2 = ResolverProxyStorageWrapper
            .getResolverProxyConfigurationV2();
        v2.configurationVersion = _newVersion;
        ResolverProxyStorageWrapper.setResolverProxyConfigurationV2(v2);
        emit ConfigVersionUpdated(EvmAccessors.getMsgSender(), oldVersion, _newVersion);
    }

    /// @inheritdoc IDiamondCut
    /// @dev Requires `DEFAULT_ADMIN_ROLE` and validates the configuration before storing the new
    ///      configuration identifier and pinned version. The admin is responsible for confirming
    ///      that `_newConfigurationId` is compatible with the currently active configuration
    ///      before calling this function; no on-chain compatibility check is performed.
    function updateConfig(
        bytes32 _newConfigurationId,
        uint256 _newVersion
    )
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyRegisteredResolverProxyConfiguration(
            ResolverProxyStorageWrapper.getBusinessLogicResolver(),
            _newConfigurationId,
            _newVersion
        )
    {
        bytes32 oldConfigurationId = ResolverProxyStorageWrapper.getResolverProxyConfigurationId();
        IResolverProxy.ResolverProxyConfigurationV2 memory v2 = ResolverProxyStorageWrapper
            .getResolverProxyConfigurationV2();
        uint256 oldConfigurationVersion = v2.configurationVersion;
        v2.configurationId = _newConfigurationId;
        v2.configurationVersion = _newVersion;
        ResolverProxyStorageWrapper.setResolverProxyConfigurationV2(v2);
        emit ConfigUpdated(
            EvmAccessors.getMsgSender(),
            oldConfigurationId,
            _newConfigurationId,
            oldConfigurationVersion,
            _newVersion
        );
    }

    /// @inheritdoc IDiamondCut
    function updateReplacementEnabled(bool _newReplacementEnabled) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        IResolverProxy.ResolverProxyConfigurationV2 memory v2 = ResolverProxyStorageWrapper
            .getResolverProxyConfigurationV2();
        bool oldReplacementEnabled = v2.replacementEnabled;
        v2.replacementEnabled = _newReplacementEnabled;
        ResolverProxyStorageWrapper.setResolverProxyConfigurationV2(v2);
        emit ReplacementEnabledUpdated(EvmAccessors.getMsgSender(), oldReplacementEnabled, _newReplacementEnabled);
    }

    /// @inheritdoc IDiamondCut
    /// @dev Requires `DEFAULT_ADMIN_ROLE`, validates `_newResolver` is a genuine
    ///      `IBusinessLogicResolver`, and validates the target configuration against it before
    ///      replacing the resolver pointer, configuration identifier and version. The admin is
    ///      responsible for confirming business-key and configuration compatibility across the
    ///      resolver switch before calling this function; no on-chain compatibility check is
    ///      performed — `_newResolver`, `_newConfigurationId` and `_newVersion` are trusted as a
    ///      deliberate, atomic choice by a trusted admin role.
    function updateResolver(
        IBusinessLogicResolver _newResolver,
        bytes32 _newConfigurationId,
        uint256 _newVersion,
        bool _newReplacementEnabled
    )
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyValidBusinessLogicResolver(_newResolver)
        onlyRegisteredResolverProxyConfiguration(_newResolver, _newConfigurationId, _newVersion)
    {
        _updateResolver(_newResolver, _newConfigurationId, _newVersion, _newReplacementEnabled);
    }

    /// @inheritdoc IDiamondCut
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

    /// @notice Body of `updateResolver()`, extracted to a private helper to give it a fresh
    ///         stack frame — the four parameters plus the old/new locals needed for the fully
    ///         old/new-covering `ResolverUpdated` event otherwise trip "stack too deep".
    function _updateResolver(
        IBusinessLogicResolver _newResolver,
        bytes32 _newConfigurationId,
        uint256 _newVersion,
        bool _newReplacementEnabled
    ) private {
        address oldResolver = address(ResolverProxyStorageWrapper.getBusinessLogicResolver());
        IResolverProxy.ResolverProxyConfigurationV2 memory oldV2 = ResolverProxyStorageWrapper
            .getResolverProxyConfigurationV2();
        ResolverProxyStorageWrapper.setBusinessLogicResolver(_newResolver);
        ResolverProxyStorageWrapper.setResolverProxyConfigurationV2(
            IResolverProxy.ResolverProxyConfigurationV2({
                configurationId: _newConfigurationId,
                configurationVersion: _newVersion,
                replacementEnabled: _newReplacementEnabled
            })
        );
        emit ResolverUpdated(
            EvmAccessors.getMsgSender(),
            oldResolver,
            address(_newResolver),
            oldV2.configurationId,
            _newConfigurationId,
            oldV2.configurationVersion,
            _newVersion,
            oldV2.replacementEnabled,
            _newReplacementEnabled
        );
    }
}
