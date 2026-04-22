// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IDocumentation } from "./IDocumentation.sol";
import { Documentation } from "./Documentation.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _DOCUMENTATION_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title DocumentationFacet
 * @notice Diamond facet that exposes on-chain document management through the
 *         `IDocumentation` interface, registered under `_DOCUMENTATION_RESOLVER_KEY`.
 * @dev Inherits document logic from `Documentation` and satisfies the
 *      `IStaticFunctionSelectors` contract required by the Diamond proxy for
 *      static selector registration. Exposes four selectors: `getDocument`,
 *      `setDocument`, `removeDocument`, and `getAllDocuments`.
 *      No library links are required for deployment.
 * @author Hashgraph Asset Tokenization
 */
contract DocumentationFacet is Documentation, IStaticFunctionSelectors {
    /**
     * @notice Returns the resolver key used to register this facet in the Diamond proxy.
     * @return staticResolverKey_ The `_DOCUMENTATION_RESOLVER_KEY` constant.
     */
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _DOCUMENTATION_RESOLVER_KEY;
    }

    /**
     * @notice Returns the four function selectors exposed by this facet for Diamond
     *         registration.
     * @return staticFunctionSelectors_ Array containing selectors for `getDocument`,
     *         `setDocument`, `removeDocument`, and `getAllDocuments`.
     */
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex = 4;
        staticFunctionSelectors_ = new bytes4[](selectorIndex);
        unchecked {
            staticFunctionSelectors_[--selectorIndex] = this.getAllDocuments.selector;
            staticFunctionSelectors_[--selectorIndex] = this.removeDocument.selector;
            staticFunctionSelectors_[--selectorIndex] = this.setDocument.selector;
            staticFunctionSelectors_[--selectorIndex] = this.getDocument.selector;
        }
    }

    /**
     * @notice Returns the interface IDs supported by this facet for ERC-165
     *         introspection.
     * @return staticInterfaceIds_ Array containing the `IDocumentation` interface ID.
     */
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        staticInterfaceIds_[0] = type(IDocumentation).interfaceId;
    }
}
