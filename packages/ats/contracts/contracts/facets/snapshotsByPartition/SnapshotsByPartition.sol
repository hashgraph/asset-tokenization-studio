// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ISnapshotsByPartition } from "./ISnapshotsByPartition.sol";
import { SnapshotsStorageWrapper } from "../../domain/asset/SnapshotsStorageWrapper.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";
import { _SNAPSHOTS_BY_PARTITION_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/// @title SnapshotsByPartition
/// @author Asset Tokenization Studio Team
/// @notice Abstract base for the SnapshotsByPartition facet, exposing partition-level snapshot reads.
/// @dev Stateless wrapper that delegates persistence reads to {SnapshotsStorageWrapper}.
///      Abstract because it is composed into the Diamond alongside other facets.
abstract contract SnapshotsByPartition is ISnapshotsByPartition, Modifiers {
    /// @inheritdoc ISnapshotsByPartition
    function initializeSnapshotsByPartition()
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyFacetNotRegistered(_SNAPSHOTS_BY_PARTITION_RESOLVER_KEY)
    {
        InitializerStorageWrapper.setFacetToReady(_SNAPSHOTS_BY_PARTITION_RESOLVER_KEY);
        emit SnapshotsByPartitionInitialized();
    }

    /// @inheritdoc ISnapshotsByPartition
    function partitionsOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) external view override returns (bytes32[] memory) {
        return SnapshotsStorageWrapper.partitionsOfAtSnapshot(_snapshotID, _tokenHolder);
    }
}
