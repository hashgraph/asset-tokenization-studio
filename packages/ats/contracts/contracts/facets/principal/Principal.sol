// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IPrincipal } from "./IPrincipal.sol";
import { BondStorageWrapper } from "../../domain/asset/BondStorageWrapper.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";
import { _PRINCIPAL_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title Principal
 * @author Asset Tokenization Studio Team
 * @notice Abstract implementation of `IPrincipal`, providing principal queries for bond tokens.
 * @dev Stateless wrapper that delegates the actual computation to {BondStorageWrapper}.
 *      Intended to be inherited by `PrincipalFacet`.
 */
abstract contract Principal is IPrincipal, Modifiers {
    /// @inheritdoc IPrincipal
    function initializePrincipal()
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyFacetNotRegistered(_PRINCIPAL_RESOLVER_KEY)
    {
        InitializerStorageWrapper.setFacetToReady(_PRINCIPAL_RESOLVER_KEY);
        emit PrincipalInitialized();
    }

    /// @inheritdoc IPrincipal
    function getPrincipalFor(address _account) external view override returns (PrincipalFor memory principalFor_) {
        return BondStorageWrapper.getPrincipalFor(_account);
    }
}
