// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ISnapshots } from "../interfaces/snapshots/ISnapshots.sol";
import { Common } from "../common/Common.sol";
import { _SNAPSHOT_ROLE } from "../constants/roles.sol";

abstract contract Snapshots is ISnapshots, Common {
    function takeSnapshot() external override onlyUnpaused onlyRole(_SNAPSHOT_ROLE) returns (uint256 snapshotID_) {
        _triggerScheduledCrossOrderedTasks(0);
        snapshotID_ = _takeSnapshot();
    }

    function decimalsAtSnapshot(uint256 _snapshotID) external view returns (uint8 decimals_) {
        decimals_ = _decimalsAtSnapshot(_snapshotID);
    }

    function balanceOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) external view override returns (uint256 balance_) {
        balance_ = _balanceOfAtSnapshot(_snapshotID, _tokenHolder);
    }

    function getTokenHoldersAtSnapshot(
        uint256 _snapshotID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (address[] memory holders_) {
        return _tokenHoldersAt(_snapshotID, _pageIndex, _pageLength);
    }

    function getTotalTokenHoldersAtSnapshot(uint256 _snapshotID) external view returns (uint256) {
        return _totalTokenHoldersAt(_snapshotID);
    }

    function balanceOfAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID,
        address _tokenHolder
    ) external view override returns (uint256 balance_) {
        balance_ = _balanceOfAtSnapshotByPartition(_partition, _snapshotID, _tokenHolder);
    }

    function partitionsOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) external view override returns (bytes32[] memory) {
        return _partitionsOfAtSnapshot(_snapshotID, _tokenHolder);
    }

    function totalSupplyAtSnapshot(uint256 _snapshotID) external view override returns (uint256 totalSupply_) {
        totalSupply_ = _totalSupplyAtSnapshot(_snapshotID);
    }

    function totalSupplyAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID
    ) external view override returns (uint256 totalSupply_) {
        totalSupply_ = _totalSupplyAtSnapshotByPartition(_partition, _snapshotID);
    }

    function lockedBalanceOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) external view override returns (uint256 balance_) {
        balance_ = _lockedBalanceOfAtSnapshot(_snapshotID, _tokenHolder);
    }

    function lockedBalanceOfAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID,
        address _tokenHolder
    ) external view override returns (uint256 balance_) {
        balance_ = _lockedBalanceOfAtSnapshotByPartition(_partition, _snapshotID, _tokenHolder);
    }

    function heldBalanceOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) external view returns (uint256 balance_) {
        balance_ = _heldBalanceOfAtSnapshot(_snapshotID, _tokenHolder);
    }

    function heldBalanceOfAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID,
        address _tokenHolder
    ) external view returns (uint256 balance_) {
        balance_ = _heldBalanceOfAtSnapshotByPartition(_partition, _snapshotID, _tokenHolder);
    }

    function clearedBalanceOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) external view returns (uint256 balance_) {
        balance_ = _clearedBalanceOfAtSnapshot(_snapshotID, _tokenHolder);
    }

    function clearedBalanceOfAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID,
        address _tokenHolder
    ) external view returns (uint256 balance_) {
        balance_ = _clearedBalanceOfAtSnapshotByPartition(_partition, _snapshotID, _tokenHolder);
    }

    function frozenBalanceOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) external view returns (uint256 balance_) {
        balance_ = _frozenBalanceOfAtSnapshot(_snapshotID, _tokenHolder);
    }

    function frozenBalanceOfAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID,
        address _tokenHolder
    ) external view returns (uint256 balance_) {
        balance_ = _frozenBalanceOfAtSnapshotByPartition(_partition, _snapshotID, _tokenHolder);
    }
}
