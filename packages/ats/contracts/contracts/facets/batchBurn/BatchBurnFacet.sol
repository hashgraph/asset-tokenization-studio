// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBatchBurn } from "./IBatchBurn.sol";
import { BatchBurn } from "./BatchBurn.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _BATCH_BURN_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title BatchBurnFacet
 * @notice Diamond facet that exposes the batch burn capability through the `IBatchBurn`
 *         interface, registered under `_BATCH_BURN_RESOLVER_KEY`.
 * @dev Inherits burn logic from `BatchBurn` and satisfies the `IStaticFunctionSelectors`
 *      contract required by the Diamond proxy for selector registration. Exposes one selector:
 *      `batchBurn`.
 * @author Asset Tokenization Studio Team
 */
contract BatchBurnFacet is BatchBurn, IStaticFunctionSelectors {
    /**
     * @notice Returns the resolver key used to register this facet in the Diamond proxy.
     * @return staticResolverKey_ The `_BATCH_BURN_RESOLVER_KEY` constant.
     */
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _BATCH_BURN_RESOLVER_KEY;
    }

    /**
     * @notice Returns the function selectors exposed by this facet for Diamond registration.
     * @return staticFunctionSelectors_ Array containing the selector for `batchBurn`.
     */
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex = 1;
        staticFunctionSelectors_ = new bytes4[](selectorIndex);
        unchecked {
            staticFunctionSelectors_[--selectorIndex] = this.batchBurn.selector;
        }
    }

    /**
     * @notice Returns the interface IDs supported by this facet for ERC-165 introspection.
     * @return staticInterfaceIds_ Array containing the `IBatchBurn` interface ID.
     */
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        staticInterfaceIds_[0] = type(IBatchBurn).interfaceId;
    }
}
