// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IHoldByPartition } from "./IHoldByPartition.sol";
import { HoldByPartition } from "./HoldByPartition.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _HOLD_BY_PARTITION_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title HoldByPartitionFacet
 * @notice Diamond facet that exposes all hold operations scoped to a specific partition
 *         through the `IHoldByPartition` interface, registered under `_HOLD_BY_PARTITION_RESOLVER_KEY`.
 * @dev Inherits hold logic from `HoldByPartition` and satisfies the `IStaticFunctionSelectors`
 *      contract required by the Diamond proxy for selector registration. Exposes nine selectors:
 *      five write operations (createHoldByPartition, createHoldFromByPartition, executeHoldByPartition,
 *      releaseHoldByPartition, reclaimHoldByPartition) and four partition-scoped read operations
 *      (getHeldAmountForByPartition, getHoldCountForByPartition, getHoldsIdForByPartition,
 *      getHoldForByPartition).
 * @author Asset Tokenization Studio Team
 */
contract HoldByPartitionFacet is HoldByPartition, IStaticFunctionSelectors {
    /**
     * @notice Returns the resolver key used to register this facet in the Diamond proxy.
     * @return staticResolverKey_ The `_HOLD_BY_PARTITION_RESOLVER_KEY` constant.
     */
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _HOLD_BY_PARTITION_RESOLVER_KEY;
    }

    /**
     * @notice Returns the function selectors exposed by this facet for Diamond registration.
     * @return staticFunctionSelectors_ Array containing the nine selectors of this facet.
     */
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex = 9;
        staticFunctionSelectors_ = new bytes4[](selectorIndex);
        unchecked {
            staticFunctionSelectors_[--selectorIndex] = this.getHoldForByPartition.selector;
            staticFunctionSelectors_[--selectorIndex] = this.getHoldsIdForByPartition.selector;
            staticFunctionSelectors_[--selectorIndex] = this.getHoldCountForByPartition.selector;
            staticFunctionSelectors_[--selectorIndex] = this.getHeldAmountForByPartition.selector;
            staticFunctionSelectors_[--selectorIndex] = this.reclaimHoldByPartition.selector;
            staticFunctionSelectors_[--selectorIndex] = this.releaseHoldByPartition.selector;
            staticFunctionSelectors_[--selectorIndex] = this.executeHoldByPartition.selector;
            staticFunctionSelectors_[--selectorIndex] = this.createHoldFromByPartition.selector;
            staticFunctionSelectors_[--selectorIndex] = this.createHoldByPartition.selector;
        }
    }

    /**
     * @notice Returns the interface IDs supported by this facet for ERC-165 introspection.
     * @return staticInterfaceIds_ Array containing the `IHoldByPartition` interface ID.
     */
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        staticInterfaceIds_[0] = type(IHoldByPartition).interfaceId;
    }
}
