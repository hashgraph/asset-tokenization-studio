// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IHoldAtSnapshotByPartition } from "./IHoldAtSnapshotByPartition.sol";
import { SnapshotsStorageWrapper } from "../../domain/asset/SnapshotsStorageWrapper.sol";

/**
 * @title HoldAtSnapshotByPartition
 * @author Asset Tokenization Studio Team
 * @notice Abstract implementation of `IHoldAtSnapshotByPartition` providing the snapshotted
 *         partition-scoped held-balance query indexed by a snapshot identifier.
 * @dev Delegates storage reads to `SnapshotsStorageWrapper`. Intended to be inherited by
 *      `HoldAtSnapshotByPartitionFacet`.
 */
abstract contract HoldAtSnapshotByPartition is IHoldAtSnapshotByPartition {
    /// @inheritdoc IHoldAtSnapshotByPartition
    function heldBalanceOfAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID,
        address _tokenHolder
    ) external view override returns (uint256 balance_) {
        balance_ = SnapshotsStorageWrapper.heldBalanceOfAtSnapshotByPartition(_partition, _snapshotID, _tokenHolder);
    }
}
