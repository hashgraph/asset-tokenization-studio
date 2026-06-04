// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ICoreAdjusted, RESOLVER_KEY_CORE_ADJUSTED } from "./ICoreAdjusted.sol";
import { CoreAdjusted } from "./CoreAdjusted.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
/**
 * @title CoreAdjustedFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet for the CoreAdjusted domain. Registers the single selector that exposes
 *         time-adjusted ERC-20 decimal reads (`decimalsAt`) to the Diamond proxy.
 * @dev Implements `IStaticFunctionSelectors` so the BusinessLogicResolver can register the facet
 *      without an off-chain deployment step. The resolver key is `RESOLVER_KEY_CORE_ADJUSTED`,
 *      annotated `@custom:hash resolverKey CoreAdjusted` and derived from
 *      `keccak256("asset.tokenization.standard.resolverKey.CoreAdjusted")`.
 *      `decimalsAt` accepts an explicit timestamp argument, so this facet needs no
 *      block-timestamp accessor of its own.
 */
contract CoreAdjustedFacet is CoreAdjusted, IStaticFunctionSelectors {
    /**
     * @notice Returns the resolver key that identifies this facet within the BusinessLogicResolver.
     * @return staticResolverKey_ The keccak256 hash of the CoreAdjusted resolver key string.
     */
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_CORE_ADJUSTED;
    }

    /**
     * @notice Returns the list of function selectors provided by this facet.
     * @return staticFunctionSelectors_ Array containing the `decimalsAt` selector.
     */
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(this.initializeCoreAdjusted.selector, this.decimalsAt.selector);
    }

    /**
     * @notice Returns the list of interface identifiers supported by this facet.
     * @return staticInterfaceIds_ Array containing the `ICoreAdjusted` interface ID.
     */
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(ICoreAdjusted).interfaceId);
    }
}
