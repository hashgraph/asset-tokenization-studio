// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IPrincipal, RESOLVER_KEY_PRINCIPAL } from "./IPrincipal.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";
import { TokenCoreOps } from "../../domain/orchestrator/TokenCoreOps.sol";

/**
 * @title Principal
 * @author Asset Tokenization Studio Team
 * @notice Abstract implementation of `IPrincipal`, providing principal queries for security tokens.
 * @dev Stateless wrapper that delegates the actual computation to {TokenCoreOps}.
 *      Intended to be inherited by `PrincipalFacet`.
 */
abstract contract Principal is IPrincipal, Modifiers {
    /// @inheritdoc IPrincipal
    function initializePrincipal()
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyFacetNotRegistered(RESOLVER_KEY_PRINCIPAL)
    {
        InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_PRINCIPAL);
        emit PrincipalInitialized();
    }

    /// @inheritdoc IPrincipal
    function getPrincipalFor(address _account) external view override returns (PrincipalFor memory principalFor_) {
        return TokenCoreOps.getPrincipalFor(_account);
    }
}
