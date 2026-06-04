// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ROLE_TREX_OWNER, DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { IIdentity, RESOLVER_KEY_IDENTITY } from "./IIdentity.sol";
import { IIdentityRegistry } from "../layer_1/ERC3643/IIdentityRegistry.sol";
import { IERC3643Types } from "../layer_1/ERC3643/IERC3643Types.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { ERC3643StorageWrapper } from "../../domain/core/ERC3643StorageWrapper.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";

/**
 * @title Identity
 * @author Asset Tokenization Studio Team
 * @notice Abstract implementation of `IIdentity`, exposing identity-registry and onchainID
 *         accessors and their authorised setters.
 * @dev Stateless wrapper that delegates the actual reads/writes to {ERC3643StorageWrapper}.
 *      Setters are gated by `onlyUnpaused` and `onlyRole(ROLE_TREX_OWNER)`. Intended to be
 *      inherited by `IdentityFacet`.
 */
abstract contract Identity is IIdentity, Modifiers {
    /// @inheritdoc IIdentity
    /// @dev Wires the identity-registry address, marks the identity facet as ready, and emits
    ///      `IdentityInitialized`. One-shot is enforced by `onlyFacetNotRegistered`.
    function initializeIdentity(
        address _identityRegistry
    ) external override onlyRole(DEFAULT_ADMIN_ROLE) onlyFacetNotRegistered(RESOLVER_KEY_IDENTITY) {
        ERC3643StorageWrapper.setIdentityRegistry(_identityRegistry);
        InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_IDENTITY);
        emit IERC3643Types.IdentityRegistryAdded(_identityRegistry);
        emit IdentityInitialized(_identityRegistry);
    }

    /// @inheritdoc IIdentity
    function setOnchainID(
        address _onchainID
    ) external override onlyOperational onlyActivated onlyUnpaused onlyRole(ROLE_TREX_OWNER) {
        ERC3643StorageWrapper.setOnchainID(_onchainID);
    }

    /// @inheritdoc IIdentity
    function setIdentityRegistry(
        address _identityRegistry
    ) external override onlyOperational onlyActivated onlyUnpaused onlyRole(ROLE_TREX_OWNER) {
        ERC3643StorageWrapper.setIdentityRegistry(_identityRegistry);
        emit IERC3643Types.IdentityRegistryAdded(_identityRegistry);
    }

    /// @inheritdoc IIdentity
    function identityRegistry() external view override returns (IIdentityRegistry) {
        return ERC3643StorageWrapper.getIdentityRegistry();
    }

    /// @inheritdoc IIdentity
    function onchainID() external view override returns (address) {
        return ERC3643StorageWrapper.getOnchainID();
    }
}
