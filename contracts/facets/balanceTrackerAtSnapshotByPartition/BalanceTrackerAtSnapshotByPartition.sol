// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    IBalanceTrackerAtSnapshotByPartition,
    RESOLVER_KEY_BALANCE_TRACKER_AT_SNAPSHOT_BY_PARTITION
} from "./IBalanceTrackerAtSnapshotByPartition.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { SnapshotsStorageWrapper } from "../../domain/asset/SnapshotsStorageWrapper.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";

/**
 * @title BalanceTrackerAtSnapshotByPartition
 * @author Asset Tokenization Studio Team
 * @notice Abstract implementation of `IBalanceTrackerAtSnapshotByPartition` providing snapshotted
 *         partition-scoped balance and total-supply queries indexed by a snapshot identifier.
 * @dev Delegates storage reads to `SnapshotsStorageWrapper`. Intended to be inherited by
 *      `BalanceTrackerAtSnapshotByPartitionFacet`.
 */
abstract contract BalanceTrackerAtSnapshotByPartition is IBalanceTrackerAtSnapshotByPartition, Modifiers {
    /// @inheritdoc IBalanceTrackerAtSnapshotByPartition
    function initializeBalanceTrackerAtSnapshotByPartition()
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyFacetNotRegistered(RESOLVER_KEY_BALANCE_TRACKER_AT_SNAPSHOT_BY_PARTITION)
    {
        InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_BALANCE_TRACKER_AT_SNAPSHOT_BY_PARTITION);
        emit IBalanceTrackerAtSnapshotByPartition.BalanceTrackerAtSnapshotByPartitionInitialized();
    }

    /// @inheritdoc IBalanceTrackerAtSnapshotByPartition
    function balanceOfAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID,
        address _tokenHolder
    ) external view override returns (uint256 balance_) {
        balance_ = SnapshotsStorageWrapper.balanceOfAtSnapshotByPartition(_partition, _snapshotID, _tokenHolder);
    }

    /// @inheritdoc IBalanceTrackerAtSnapshotByPartition
    function totalSupplyAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID
    ) external view override returns (uint256 totalSupply_) {
        totalSupply_ = SnapshotsStorageWrapper.totalSupplyAtSnapshotByPartition(_partition, _snapshotID);
    }
}
