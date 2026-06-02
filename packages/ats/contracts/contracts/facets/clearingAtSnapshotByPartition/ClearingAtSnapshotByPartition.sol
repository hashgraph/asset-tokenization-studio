// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    IClearingAtSnapshotByPartition,
    RESOLVER_KEY_CLEARING_AT_SNAPSHOT_BY_PARTITION
} from "./IClearingAtSnapshotByPartition.sol";
import { SnapshotsStorageWrapper } from "../../domain/asset/SnapshotsStorageWrapper.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";

/**
 * @title ClearingAtSnapshotByPartition
 * @author Asset Tokenization Studio Team
 * @notice Abstract implementation of `IClearingAtSnapshotByPartition` providing the snapshotted
 *         partition-scoped cleared-balance query indexed by a snapshot identifier.
 * @dev Delegates storage reads to `SnapshotsStorageWrapper`. Intended to be inherited by
 *      `ClearingAtSnapshotByPartitionFacet`.
 */
abstract contract ClearingAtSnapshotByPartition is IClearingAtSnapshotByPartition, Modifiers {
    /// @inheritdoc IClearingAtSnapshotByPartition
    function initializeClearingAtSnapshotByPartition()
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyFacetNotRegistered(RESOLVER_KEY_CLEARING_AT_SNAPSHOT_BY_PARTITION)
    {
        InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_CLEARING_AT_SNAPSHOT_BY_PARTITION);
        emit ClearingAtSnapshotByPartitionInitialized();
    }

    /// @inheritdoc IClearingAtSnapshotByPartition
    function clearedBalanceOfAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID,
        address _tokenHolder
    ) external view override returns (uint256 balance_) {
        balance_ = SnapshotsStorageWrapper.clearedBalanceOfAtSnapshotByPartition(_partition, _snapshotID, _tokenHolder);
    }
}
