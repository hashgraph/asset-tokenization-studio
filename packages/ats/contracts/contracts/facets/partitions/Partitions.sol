// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IPartitions } from "./IPartitions.sol";
import { ERC1410StorageWrapper } from "../../domain/asset/ERC1410StorageWrapper.sol";

/**
 * @title Partitions
 * @author Asset Tokenization Studio Team
 * @notice Abstract implementation of `IPartitions`, exposing the partition-discovery accessors
 *         (`partitionsOf`, `isMultiPartition`) backed by ERC-1410 storage.
 * @dev Stateless wrapper that delegates the actual reads to {ERC1410StorageWrapper}. Intended to
 *      be inherited by `PartitionsFacet`.
 */
abstract contract Partitions is IPartitions {
    /// @inheritdoc IPartitions
    function partitionsOf(address _tokenHolder) external view override returns (bytes32[] memory) {
        return ERC1410StorageWrapper.partitionsOf(_tokenHolder);
    }

    /// @inheritdoc IPartitions
    function isMultiPartition() external view override returns (bool) {
        return ERC1410StorageWrapper.isMultiPartition();
    }
}
