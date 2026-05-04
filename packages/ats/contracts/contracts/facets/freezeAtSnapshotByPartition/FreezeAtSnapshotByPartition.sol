// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IFreezeAtSnapshotByPartition } from "./IFreezeAtSnapshotByPartition.sol";
import { SnapshotsStorageWrapper } from "../../domain/asset/SnapshotsStorageWrapper.sol";

/**
 * @title FreezeAtSnapshotByPartition
 * @author Asset Tokenization Studio Team
 * @notice Abstract implementation of `IFreezeAtSnapshotByPartition`, providing partition-aware
 *         snapshot frozen balance queries.
 * @dev Stateless wrapper that delegates the actual lookup to {SnapshotsStorageWrapper}.
 *      Intended to be inherited by `FreezeAtSnapshotByPartitionFacet`.
 */
abstract contract FreezeAtSnapshotByPartition is IFreezeAtSnapshotByPartition {
    /// @inheritdoc IFreezeAtSnapshotByPartition
    function frozenBalanceOfAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID,
        address _tokenHolder
    ) external view override returns (uint256 balance_) {
        balance_ = SnapshotsStorageWrapper.frozenBalanceOfAtSnapshotByPartition(_partition, _snapshotID, _tokenHolder);
    }
}
