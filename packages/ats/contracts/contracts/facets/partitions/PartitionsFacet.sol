// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IPartitions } from "./IPartitions.sol";
import { Partitions } from "./Partitions.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _PARTITIONS_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title PartitionsFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet exposing partition-discovery accessors via `IPartitions`, registered
 *         under `_PARTITIONS_RESOLVER_KEY`.
 * @dev Consolidates `partitionsOf` and `isMultiPartition`, previously hosted in
 *      `ERC1410ReadFacet`. Exposes 2 selectors.
 */
contract PartitionsFacet is Partitions, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _PARTITIONS_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex = 2;
        staticFunctionSelectors_ = new bytes4[](selectorIndex);
        unchecked {
            staticFunctionSelectors_[--selectorIndex] = this.isMultiPartition.selector;
            staticFunctionSelectors_[--selectorIndex] = this.partitionsOf.selector;
        }
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        staticInterfaceIds_[0] = type(IPartitions).interfaceId;
    }
}
