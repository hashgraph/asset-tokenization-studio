// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBalanceTrackerAtSnapshotByPartition } from "./IBalanceTrackerAtSnapshotByPartition.sol";
import { SnapshotsStorageWrapper } from "../../domain/asset/SnapshotsStorageWrapper.sol";

/**
 * @title BalanceTrackerAtSnapshotByPartition
 * @author Asset Tokenization Studio Team
 * @notice Abstract implementation of `IBalanceTrackerAtSnapshotByPartition` providing snapshotted
 *         partition-scoped balance and total-supply queries indexed by a snapshot identifier.
 * @dev Delegates storage reads to `SnapshotsStorageWrapper`. Intended to be inherited by
 *      `BalanceTrackerAtSnapshotByPartitionFacet`.
 */
abstract contract BalanceTrackerAtSnapshotByPartition is IBalanceTrackerAtSnapshotByPartition {
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
