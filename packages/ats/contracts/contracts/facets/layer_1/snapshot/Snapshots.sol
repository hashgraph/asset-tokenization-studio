// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ISnapshots } from "./ISnapshots.sol";
import { SNAPSHOT_ROLE } from "../../../constants/roles.sol";
import { Modifiers } from "../../../services/Modifiers.sol";
import { SnapshotsStorageWrapper } from "../../../domain/asset/SnapshotsStorageWrapper.sol";
import { ScheduledTasksStorageWrapper } from "../../../domain/asset/ScheduledTasksStorageWrapper.sol";
import { ScheduledTask } from "../../layer_2/scheduledTask/scheduledTasksCommon/IScheduledTasksCommon.sol";
import { EvmAccessors } from "../../../infrastructure/utils/EvmAccessors.sol";

abstract contract Snapshots is ISnapshots, Modifiers {
    function takeSnapshot() external override onlyUnpaused onlyRole(SNAPSHOT_ROLE) returns (uint256 snapshotID_) {
        ScheduledTasksStorageWrapper.triggerScheduledCrossOrderedTasks(0);
        snapshotID_ = SnapshotsStorageWrapper.takeSnapshot();
        emit SnapshotTaken(EvmAccessors.getMsgSender(), snapshotID_);
    }

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

    function getTotalTokenHoldersAtSnapshot(uint256 _snapshotID) external view returns (uint256) {
        return SnapshotsStorageWrapper.totalTokenHoldersAt(_snapshotID);
    }

    function balanceOfAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID,
        address _tokenHolder
    ) external view override returns (uint256 balance_) {
        balance_ = SnapshotsStorageWrapper.balanceOfAtSnapshotByPartition(_partition, _snapshotID, _tokenHolder);
    }

    function partitionsOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) external view override returns (bytes32[] memory) {
        return SnapshotsStorageWrapper.partitionsOfAtSnapshot(_snapshotID, _tokenHolder);
    }

    function totalSupplyAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID
    ) external view override returns (uint256 totalSupply_) {
        totalSupply_ = SnapshotsStorageWrapper.totalSupplyAtSnapshotByPartition(_partition, _snapshotID);
    }

    function lockedBalanceOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) external view override returns (uint256 balance_) {
        balance_ = SnapshotsStorageWrapper.lockedBalanceOfAtSnapshot(_snapshotID, _tokenHolder);
    }

    function lockedBalanceOfAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID,
        address _tokenHolder
    ) external view override returns (uint256 balance_) {
        balance_ = SnapshotsStorageWrapper.lockedBalanceOfAtSnapshotByPartition(_partition, _snapshotID, _tokenHolder);
    }

    function heldBalanceOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) external view returns (uint256 balance_) {
        balance_ = SnapshotsStorageWrapper.heldBalanceOfAtSnapshot(_snapshotID, _tokenHolder);
    }

    function heldBalanceOfAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID,
        address _tokenHolder
    ) external view returns (uint256 balance_) {
        balance_ = SnapshotsStorageWrapper.heldBalanceOfAtSnapshotByPartition(_partition, _snapshotID, _tokenHolder);
    }

    function clearedBalanceOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) external view returns (uint256 balance_) {
        balance_ = SnapshotsStorageWrapper.clearedBalanceOfAtSnapshot(_snapshotID, _tokenHolder);
    }

    function clearedBalanceOfAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID,
        address _tokenHolder
    ) external view returns (uint256 balance_) {
        balance_ = SnapshotsStorageWrapper.clearedBalanceOfAtSnapshotByPartition(_partition, _snapshotID, _tokenHolder);
    }

    function frozenBalanceOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) external view returns (uint256 balance_) {
        balance_ = SnapshotsStorageWrapper.frozenBalanceOfAtSnapshot(_snapshotID, _tokenHolder);
    }

    function frozenBalanceOfAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID,
        address _tokenHolder
    ) external view returns (uint256 balance_) {
        balance_ = SnapshotsStorageWrapper.frozenBalanceOfAtSnapshotByPartition(_partition, _snapshotID, _tokenHolder);
    }

    function scheduledSnapshotCount() external view override returns (uint256) {
        return ScheduledTasksStorageWrapper.getScheduledSnapshotCount();
    }

    function getScheduledSnapshots(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (ScheduledTask[] memory scheduledSnapshot_) {
        scheduledSnapshot_ = ScheduledTasksStorageWrapper.getScheduledSnapshots(_pageIndex, _pageLength);
    }
}
