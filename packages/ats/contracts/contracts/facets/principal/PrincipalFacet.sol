// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IPrincipal, RESOLVER_KEY_PRINCIPAL } from "./IPrincipal.sol";
import { Principal } from "./Principal.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
/**
 * @title PrincipalFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet exposing principal queries via `IPrincipal`, registered under
 *         `RESOLVER_KEY_PRINCIPAL`.
 * @dev Consolidates `getPrincipalFor` previously hosted in `BondRead` / `BondUSAReadFacetBase`.
 *      Exposes 1 selector: `getPrincipalFor`.
 */
contract PrincipalFacet is Principal, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_PRINCIPAL;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(this.initializePrincipal.selector, this.getPrincipalFor.selector);
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IPrincipal).interfaceId);
    }
}
