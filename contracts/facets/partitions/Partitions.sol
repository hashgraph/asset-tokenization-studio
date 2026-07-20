// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IPartitions, RESOLVER_KEY_PARTITIONS } from "./IPartitions.sol";
import { ERC1410StorageWrapper } from "../../domain/asset/ERC1410StorageWrapper.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";

/**
 * @title Partitions
 * @author Asset Tokenization Studio Team
 * @notice Abstract implementation of `IPartitions`, exposing the one-shot `initializePartitions`
 *         initialiser and the partition-discovery accessors (`partitionsOf`, `isMultiPartition`)
 *         backed by ERC-1410 storage.
 * @dev Delegates the initialiser write and the reads to {ERC1410StorageWrapper}. Intended to be
 *      inherited by `PartitionsFacet`.
 */
abstract contract Partitions is IPartitions, Modifiers {
    /// @inheritdoc IPartitions
    /// @dev Writes the multi-partition flag to ERC-1410 storage, marks the facet ready, and emits
    ///      `PartitionsInitialized`. One-shot is enforced by `onlyFacetNotRegistered`.
    function initializePartitions(
        bool _multiPartition
    ) external override onlyRole(DEFAULT_ADMIN_ROLE) onlyFacetNotRegistered(RESOLVER_KEY_PARTITIONS) {
        ERC1410StorageWrapper.initializeERC1410(_multiPartition);
        InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_PARTITIONS);
        emit PartitionsInitialized(_multiPartition);
    }

    /// @inheritdoc IPartitions
    function partitionsOf(address _tokenHolder) external view override returns (bytes32[] memory) {
        return ERC1410StorageWrapper.partitionsOf(_tokenHolder);
    }

    /// @inheritdoc IPartitions
    function isMultiPartition() external view override returns (bool) {
        return ERC1410StorageWrapper.isMultiPartition();
    }
}
