// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    IFreezeAtSnapshotByPartition,
    RESOLVER_KEY_FREEZE_AT_SNAPSHOT_BY_PARTITION
} from "./IFreezeAtSnapshotByPartition.sol";
import { SnapshotsStorageWrapper } from "../../domain/asset/SnapshotsStorageWrapper.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";

/**
 * @title FreezeAtSnapshotByPartition
 * @author Asset Tokenization Studio Team
 * @notice Abstract implementation of `IFreezeAtSnapshotByPartition`, providing partition-aware
 *         snapshot frozen balance queries.
 * @dev Stateless wrapper that delegates the actual lookup to {SnapshotsStorageWrapper}.
 *      Intended to be inherited by `FreezeAtSnapshotByPartitionFacet`.
 */
abstract contract FreezeAtSnapshotByPartition is IFreezeAtSnapshotByPartition, Modifiers {
    /// @inheritdoc IFreezeAtSnapshotByPartition
    function initializeFreezeAtSnapshotByPartition()
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyFacetNotRegistered(RESOLVER_KEY_FREEZE_AT_SNAPSHOT_BY_PARTITION)
    {
        InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_FREEZE_AT_SNAPSHOT_BY_PARTITION);
        emit FreezeAtSnapshotByPartitionInitialized();
    }

    /// @inheritdoc IFreezeAtSnapshotByPartition
    function frozenBalanceOfAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID,
        address _tokenHolder
    ) external view override returns (uint256 balance_) {
        balance_ = SnapshotsStorageWrapper.frozenBalanceOfAtSnapshotByPartition(_partition, _snapshotID, _tokenHolder);
    }
}
