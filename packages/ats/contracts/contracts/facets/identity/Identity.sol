// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { TREX_OWNER_ROLE } from "../../constants/roles.sol";
import { IIdentity } from "./IIdentity.sol";
import { IIdentityRegistry } from "../layer_1/ERC3643/IIdentityRegistry.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { ERC3643StorageWrapper } from "../../domain/core/ERC3643StorageWrapper.sol";

/**
 * @title Identity
 * @author Asset Tokenization Studio Team
 * @notice Abstract implementation of `IIdentity`, exposing identity-registry and onchainID
 *         accessors and their authorised setters.
 * @dev Stateless wrapper that delegates the actual reads/writes to {ERC3643StorageWrapper}.
 *      Setters are gated by `onlyUnpaused` and `onlyRole(TREX_OWNER_ROLE)`. Intended to be
 *      inherited by `IdentityFacet`.
 */
abstract contract Identity is IIdentity, Modifiers {
    /// @inheritdoc IIdentity
    function setOnchainID(address _onchainID) external override onlyUnpaused onlyRole(TREX_OWNER_ROLE) {
        ERC3643StorageWrapper.setOnchainID(_onchainID);
    }

    /// @inheritdoc IIdentity
    function setIdentityRegistry(address _identityRegistry) external override onlyUnpaused onlyRole(TREX_OWNER_ROLE) {
        ERC3643StorageWrapper.setIdentityRegistry(_identityRegistry);
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
