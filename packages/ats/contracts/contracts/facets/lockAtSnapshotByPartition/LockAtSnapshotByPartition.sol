// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ILockAtSnapshotByPartition } from "./ILockAtSnapshotByPartition.sol";
import { SnapshotsStorageWrapper } from "../../domain/asset/SnapshotsStorageWrapper.sol";

/**
 * @title  LockAtSnapshotByPartition
 * @notice Abstract implementation of `ILockAtSnapshotByPartition`.
 * @dev    Delegates all storage reads to `SnapshotsStorageWrapper`. Intended to be
 *         inherited solely by `LockAtSnapshotByPartitionFacet`.
 * @author Asset Tokenization Studio Team
 */
abstract contract LockAtSnapshotByPartition is ILockAtSnapshotByPartition {
    /// @inheritdoc ILockAtSnapshotByPartition
    function lockedBalanceOfAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID,
        address _tokenHolder
    ) external view override returns (uint256 balance_) {
        balance_ = SnapshotsStorageWrapper.lockedBalanceOfAtSnapshotByPartition(_partition, _snapshotID, _tokenHolder);
    }
}
