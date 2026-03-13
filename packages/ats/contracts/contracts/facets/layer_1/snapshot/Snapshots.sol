// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ISnapshots, HolderBalance } from "./ISnapshots.sol";
import { _SNAPSHOT_ROLE } from "../../../constants/roles.sol";
import { AccessControlStorageWrapper } from "../../../domain/core/AccessControlStorageWrapper.sol";
import { PauseStorageWrapper } from "../../../domain/core/PauseStorageWrapper.sol";
import { SnapshotsStorageWrapper } from "../../../domain/asset/SnapshotsStorageWrapper.sol";
import { ScheduledTasksStorageWrapper } from "../../../domain/asset/ScheduledTasksStorageWrapper.sol";

abstract contract Snapshots is ISnapshots {
    function takeSnapshot() external override returns (uint256 snapshotID_) {
        PauseStorageWrapper._requireNotPaused();
        AccessControlStorageWrapper._checkRole(_SNAPSHOT_ROLE, msg.sender);
        ScheduledTasksStorageWrapper._callTriggerPendingScheduledCrossOrderedTasks();
        snapshotID_ = SnapshotsStorageWrapper._takeSnapshot();
        emit SnapshotTaken(msg.sender, snapshotID_);
    }

    function decimalsAtSnapshot(uint256 _snapshotID) external view returns (uint8 decimals_) {
        decimals_ = SnapshotsStorageWrapper._decimalsAtSnapshot(_snapshotID);
    }

    function balancesOfAtSnapshot(
        uint256 _snapshotID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (HolderBalance[] memory balances_) {
        balances_ = SnapshotsStorageWrapper._balancesOfAtSnapshot(_snapshotID, _pageIndex, _pageLength);
    }

    function balanceOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) external view override returns (uint256 balance_) {
        balance_ = SnapshotsStorageWrapper._balanceOfAtSnapshot(_snapshotID, _tokenHolder);
    }

    function getTokenHoldersAtSnapshot(
        uint256 _snapshotID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (address[] memory holders_) {
        return SnapshotsStorageWrapper._tokenHoldersAt(_snapshotID, _pageIndex, _pageLength);
    }

    function getTotalTokenHoldersAtSnapshot(uint256 _snapshotID) external view returns (uint256) {
        return SnapshotsStorageWrapper._totalTokenHoldersAt(_snapshotID);
    }

    function balanceOfAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID,
        address _tokenHolder
    ) external view override returns (uint256 balance_) {
        balance_ = SnapshotsStorageWrapper._balanceOfAtSnapshotByPartition(_partition, _snapshotID, _tokenHolder);
    }

    function partitionsOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) external view override returns (bytes32[] memory) {
        return SnapshotsStorageWrapper._partitionsOfAtSnapshot(_snapshotID, _tokenHolder);
    }

    function totalSupplyAtSnapshot(uint256 _snapshotID) external view override returns (uint256 totalSupply_) {
        totalSupply_ = SnapshotsStorageWrapper._totalSupplyAtSnapshot(_snapshotID);
    }

    function totalSupplyAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID
    ) external view override returns (uint256 totalSupply_) {
        totalSupply_ = SnapshotsStorageWrapper._totalSupplyAtSnapshotByPartition(_partition, _snapshotID);
    }

    function lockedBalanceOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) external view override returns (uint256 balance_) {
        balance_ = SnapshotsStorageWrapper._lockedBalanceOfAtSnapshot(_snapshotID, _tokenHolder);
    }

    function lockedBalanceOfAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID,
        address _tokenHolder
    ) external view override returns (uint256 balance_) {
        balance_ = SnapshotsStorageWrapper._lockedBalanceOfAtSnapshotByPartition(_partition, _snapshotID, _tokenHolder);
    }

    function heldBalanceOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) external view returns (uint256 balance_) {
        balance_ = SnapshotsStorageWrapper._heldBalanceOfAtSnapshot(_snapshotID, _tokenHolder);
    }

    function heldBalanceOfAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID,
        address _tokenHolder
    ) external view returns (uint256 balance_) {
        balance_ = SnapshotsStorageWrapper._heldBalanceOfAtSnapshotByPartition(_partition, _snapshotID, _tokenHolder);
    }

    function clearedBalanceOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) external view returns (uint256 balance_) {
        balance_ = SnapshotsStorageWrapper._clearedBalanceOfAtSnapshot(_snapshotID, _tokenHolder);
    }

    function clearedBalanceOfAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID,
        address _tokenHolder
    ) external view returns (uint256 balance_) {
        balance_ = SnapshotsStorageWrapper._clearedBalanceOfAtSnapshotByPartition(
            _partition,
            _snapshotID,
            _tokenHolder
        );
    }

    function frozenBalanceOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) external view returns (uint256 balance_) {
        balance_ = SnapshotsStorageWrapper._frozenBalanceOfAtSnapshot(_snapshotID, _tokenHolder);
    }

    function frozenBalanceOfAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID,
        address _tokenHolder
    ) external view returns (uint256 balance_) {
        balance_ = SnapshotsStorageWrapper._frozenBalanceOfAtSnapshotByPartition(_partition, _snapshotID, _tokenHolder);
    }
}
