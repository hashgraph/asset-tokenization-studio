// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IHoldAtSnapshotByPartition } from "./IHoldAtSnapshotByPartition.sol";
import { SnapshotsStorageWrapper } from "../../domain/asset/SnapshotsStorageWrapper.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";
import { _HOLD_AT_SNAPSHOT_BY_PARTITION_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title HoldAtSnapshotByPartition
 * @author Asset Tokenization Studio Team
 * @notice Abstract implementation of `IHoldAtSnapshotByPartition` providing the snapshotted
 *         partition-scoped held-balance query indexed by a snapshot identifier.
 * @dev Delegates storage reads to `SnapshotsStorageWrapper`. Intended to be inherited by
 *      `HoldAtSnapshotByPartitionFacet`.
 */
abstract contract HoldAtSnapshotByPartition is IHoldAtSnapshotByPartition, Modifiers {
    /// @inheritdoc IHoldAtSnapshotByPartition
    function initializeHoldAtSnapshotByPartition()
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyFacetNotRegistered(_HOLD_AT_SNAPSHOT_BY_PARTITION_RESOLVER_KEY)
    {
        InitializerStorageWrapper.setFacetToReady(_HOLD_AT_SNAPSHOT_BY_PARTITION_RESOLVER_KEY);
        emit HoldAtSnapshotByPartitionInitialized();
    }

    /// @inheritdoc IHoldAtSnapshotByPartition
    function heldBalanceOfAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID,
        address _tokenHolder
    ) external view override returns (uint256 balance_) {
        balance_ = SnapshotsStorageWrapper.heldBalanceOfAtSnapshotByPartition(_partition, _snapshotID, _tokenHolder);
    }
}
