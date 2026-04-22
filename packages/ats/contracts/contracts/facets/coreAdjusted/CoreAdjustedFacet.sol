// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ICoreAdjusted } from "./ICoreAdjusted.sol";
import { CoreAdjusted } from "./CoreAdjusted.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _CORE_ADJUSTED_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title CoreAdjustedFacet
 * @notice Diamond facet for the CoreAdjusted domain. Registers the single selector that exposes
 *         time-adjusted ERC-20 decimal reads (`decimalsAt`) to the Diamond proxy.
 * @dev Implements `IStaticFunctionSelectors` so the BusinessLogicResolver can register the facet
 *      without an off-chain deployment step. The resolver key is
 *      `keccak256("security.token.standard.coreadjusted.resolverKey")`.
 *      No TimeTravel variant is required because `decimalsAt` already accepts an explicit
 *      timestamp parameter, making block-timestamp substitution unnecessary.
 */
contract CoreAdjustedFacet is CoreAdjusted, IStaticFunctionSelectors {
    /**
     * @notice Returns the resolver key that identifies this facet within the BusinessLogicResolver.
     * @return staticResolverKey_ The keccak256 hash of the CoreAdjusted resolver key string.
     */
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _CORE_ADJUSTED_RESOLVER_KEY;
    }

    /**
     * @notice Returns the list of function selectors provided by this facet.
     * @return staticFunctionSelectors_ Array containing the `decimalsAt` selector.
     */
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        staticFunctionSelectors_ = new bytes4[](1);
        staticFunctionSelectors_[0] = this.decimalsAt.selector;
    }

    /**
     * @notice Returns the list of interface identifiers supported by this facet.
     * @return staticInterfaceIds_ Array containing the `ICoreAdjusted` interface ID.
     */
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        staticInterfaceIds_[0] = type(ICoreAdjusted).interfaceId;
    }
}
