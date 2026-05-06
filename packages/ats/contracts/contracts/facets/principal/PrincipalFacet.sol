// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IPrincipal } from "./IPrincipal.sol";
import { Principal } from "./Principal.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _PRINCIPAL_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title PrincipalFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet exposing principal queries via `IPrincipal`, registered under
 *         `_PRINCIPAL_RESOLVER_KEY`.
 * @dev Consolidates `getPrincipalFor` previously hosted in `BondRead` / `BondUSAReadFacetBase`.
 *      Exposes 1 selector: `getPrincipalFor`.
 */
contract PrincipalFacet is Principal, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _PRINCIPAL_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex = 1;
        staticFunctionSelectors_ = new bytes4[](selectorIndex);
        unchecked {
            staticFunctionSelectors_[--selectorIndex] = this.getPrincipalFor.selector;
        }
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        staticInterfaceIds_[0] = type(IPrincipal).interfaceId;
    }
}
