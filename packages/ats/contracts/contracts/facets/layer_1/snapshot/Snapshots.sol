// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ISnapshots } from "./ISnapshots.sol";
import { SNAPSHOT_ROLE } from "../../../constants/roles.sol";
import { Modifiers } from "../../../services/Modifiers.sol";
import { SnapshotsStorageWrapper } from "../../../domain/asset/SnapshotsStorageWrapper.sol";
import { ScheduledTasksStorageWrapper } from "../../../domain/asset/ScheduledTasksStorageWrapper.sol";
import { ScheduledTask } from "../../layer_2/scheduledTask/scheduledTasksCommon/IScheduledTasksCommon.sol";
import { EvmAccessors } from "../../../infrastructure/utils/EvmAccessors.sol";

/**
 * @title Snapshots
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet exposing the snapshot surface of the asset: capturing point-in-time
 *         balances and total supplies and reading historical state by snapshot identifier.
 * @dev Stateless wrapper that delegates persistence to {SnapshotsStorageWrapper} and scheduling
 *      logic to {ScheduledTasksStorageWrapper}. Snapshots are materialised lazily: balances and
 *      total supplies are only written to the snapshot mapping when the underlying value next
 *      changes after the snapshot was taken, so reads must consult the wrapper's lookup helpers
 *      rather than dedicated storage. The facet is `abstract` because it is composed into the
 *      diamond alongside other facets sharing the {Modifiers} base.
 */
abstract contract Snapshots is ISnapshots, Modifiers {
    /**
     * @inheritdoc ISnapshots
     * @dev Gated by `onlyUnpaused` and `onlyRole(SNAPSHOT_ROLE)`. Before assigning a new snapshot
     *      identifier, any cross-ordered scheduled tasks due at the current block are flushed via
     *      {ScheduledTasksStorageWrapper.triggerScheduledCrossOrderedTasks} so that their effects
     *      are reflected in the captured state. Emits {SnapshotTaken} with the resolved sender
     *      (meta-transaction-aware via {EvmAccessors.getMsgSender}) and the new identifier.
     */
    function takeSnapshot() external override onlyUnpaused onlyRole(SNAPSHOT_ROLE) returns (uint256 snapshotID_) {
        ScheduledTasksStorageWrapper.triggerScheduledCrossOrderedTasks(0);
        snapshotID_ = SnapshotsStorageWrapper.takeSnapshot();
        emit SnapshotTaken(EvmAccessors.getMsgSender(), snapshotID_);
    }

    /// @inheritdoc ISnapshots
    function decimalsAtSnapshot(uint256 _snapshotID) external view returns (uint8 decimals_) {
        decimals_ = SnapshotsStorageWrapper.decimalsAtSnapshot(_snapshotID);
    }

    function getTokenHoldersAtSnapshot(
        uint256 _snapshotID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (address[] memory holders_) {
        return SnapshotsStorageWrapper.tokenHoldersAt(_snapshotID, _pageIndex, _pageLength);
    }

    /// @inheritdoc ISnapshots
    function getTotalTokenHoldersAtSnapshot(uint256 _snapshotID) external view returns (uint256) {
        return SnapshotsStorageWrapper.totalTokenHoldersAt(_snapshotID);
    }

    function partitionsOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) external view override returns (bytes32[] memory) {
        return SnapshotsStorageWrapper.partitionsOfAtSnapshot(_snapshotID, _tokenHolder);
    }

    function lockedBalanceOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) external view override returns (uint256 balance_) {
        balance_ = SnapshotsStorageWrapper.lockedBalanceOfAtSnapshot(_snapshotID, _tokenHolder);
    }

    /// @inheritdoc ISnapshots
    function lockedBalanceOfAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID,
        address _tokenHolder
    ) external view override returns (uint256 balance_) {
        balance_ = SnapshotsStorageWrapper.lockedBalanceOfAtSnapshotByPartition(_partition, _snapshotID, _tokenHolder);
    }

    /// @inheritdoc ISnapshots
    function heldBalanceOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) external view returns (uint256 balance_) {
        balance_ = SnapshotsStorageWrapper.heldBalanceOfAtSnapshot(_snapshotID, _tokenHolder);
    }

    /// @inheritdoc ISnapshots
    function heldBalanceOfAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID,
        address _tokenHolder
    ) external view returns (uint256 balance_) {
        balance_ = SnapshotsStorageWrapper.heldBalanceOfAtSnapshotByPartition(_partition, _snapshotID, _tokenHolder);
    }

    /// @inheritdoc ISnapshots
    function clearedBalanceOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) external view returns (uint256 balance_) {
        balance_ = SnapshotsStorageWrapper.clearedBalanceOfAtSnapshot(_snapshotID, _tokenHolder);
    }

    /// @inheritdoc ISnapshots
    function clearedBalanceOfAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID,
        address _tokenHolder
    ) external view returns (uint256 balance_) {
        balance_ = SnapshotsStorageWrapper.clearedBalanceOfAtSnapshotByPartition(_partition, _snapshotID, _tokenHolder);
    }

    /// @inheritdoc ISnapshots
    function frozenBalanceOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) external view returns (uint256 balance_) {
        balance_ = SnapshotsStorageWrapper.frozenBalanceOfAtSnapshot(_snapshotID, _tokenHolder);
    }

    /// @inheritdoc ISnapshots
    function frozenBalanceOfAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID,
        address _tokenHolder
    ) external view returns (uint256 balance_) {
        balance_ = SnapshotsStorageWrapper.frozenBalanceOfAtSnapshotByPartition(_partition, _snapshotID, _tokenHolder);
    }

    /// @inheritdoc ISnapshots
    function scheduledSnapshotCount() external view override returns (uint256) {
        return ScheduledTasksStorageWrapper.getScheduledSnapshotCount();
    }

    /// @inheritdoc ISnapshots
    function getScheduledSnapshots(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (ScheduledTask[] memory scheduledSnapshot_) {
        scheduledSnapshot_ = ScheduledTasksStorageWrapper.getScheduledSnapshots(_pageIndex, _pageLength);
    }
}
