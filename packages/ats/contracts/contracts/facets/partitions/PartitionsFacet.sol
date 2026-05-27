// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IPartitions, RESOLVER_KEY_PARTITIONS } from "./IPartitions.sol";
import { Partitions } from "./Partitions.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
/**
 * @title PartitionsFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet exposing partition-discovery accessors via `IPartitions`, registered
 *         under `RESOLVER_KEY_PARTITIONS`.
 * @dev Exposes 2 selectors: `partitionsOf` and `isMultiPartition`.
 */
contract PartitionsFacet is Partitions, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_PARTITIONS;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(this.partitionsOf.selector, this.isMultiPartition.selector);
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IPartitions).interfaceId);
    }
}
