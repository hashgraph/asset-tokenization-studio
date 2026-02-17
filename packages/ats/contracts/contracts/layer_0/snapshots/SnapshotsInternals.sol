// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ERC3643Internals } from "../ERC3643/ERC3643Internals.sol";
import { Snapshots, PartitionSnapshots, SnapshotsAddress } from "../../layer_1/interfaces/snapshots/ISnapshots.sol";

abstract contract SnapshotsInternals is ERC3643Internals {
    function _snapshot() internal virtual returns (uint256);
    function _takeSnapshot() internal virtual returns (uint256 snapshotID_);
    function _updateSnapshot(Snapshots storage snapshots, uint256 currentValue) internal virtual;
    function _updateSnapshotAddress(SnapshotsAddress storage snapshots, address currentValue) internal virtual;
    function _updateSnapshotPartitions(
        Snapshots storage snapshots,
        PartitionSnapshots storage partitionSnapshots,
        uint256 currentValueForPartition,
        bytes32[] memory partitionIds
    ) internal virtual;
    function _updateTotalSupplySnapshot(bytes32 partition) internal virtual;
    function _updateTotalTokenHolderSnapshot() internal virtual;
    function _abafAtSnapshot(uint256 _snapshotID) internal view virtual returns (uint256 abaf_);
    function _addressValueAt(
        uint256 snapshotId,
        SnapshotsAddress storage snapshots
    ) internal view virtual returns (bool, address);
    function _balanceOfAt(address _tokenHolder, uint256 _snapshotId) internal view virtual returns (uint256);
    function _balanceOfAtAdjusted(
        uint256 _snapshotId,
        Snapshots storage _snapshots,
        uint256 _currentBalanceAdjusted
    ) internal view virtual returns (uint256);
    function _balanceOfAtByPartition(
        bytes32 _partition,
        address account,
        uint256 snapshotId
    ) internal view virtual returns (uint256);
    function _balanceOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) internal view virtual returns (uint256 balance_);
    function _balanceOfAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID,
        address _tokenHolder
    ) internal view virtual returns (uint256 balance_);
    function _clearedBalanceOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) internal view virtual returns (uint256 balance_);
    function _clearedBalanceOfAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID,
        address _tokenHolder
    ) internal view virtual returns (uint256 balance_);
    function _decimalsAtSnapshot(uint256 _snapshotID) internal view virtual returns (uint8 decimals_);
    function _frozenBalanceOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) internal view virtual returns (uint256 balance_);
    function _frozenBalanceOfAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID,
        address _tokenHolder
    ) internal view virtual returns (uint256 balance_);
    function _getCurrentSnapshotId() internal view virtual returns (uint256);
    function _getSnapshotBalanceForIfDateReached(
        uint256 _date,
        uint256 _snapshotId,
        address _account
    ) internal view virtual returns (uint256 balance_, uint8 decimals_, bool dateReached_);
    function _heldBalanceOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) internal view virtual returns (uint256 balance_);
    function _heldBalanceOfAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID,
        address _tokenHolder
    ) internal view virtual returns (uint256 balance_);
    function _indexFor(uint256 snapshotId, uint256[] storage ids) internal view virtual returns (bool, uint256);
    function _lastSnapshotId(uint256[] storage ids) internal view virtual returns (uint256);
    function _lockedBalanceOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) internal view virtual returns (uint256 balance_);
    function _lockedBalanceOfAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID,
        address _tokenHolder
    ) internal view virtual returns (uint256 balance_);
    function _partitionsOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) internal view virtual returns (bytes32[] memory);
    function _tokenHoldersAt(
        uint256 snapshotId,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view virtual returns (address[] memory);
    function _totalSupplyAt(uint256 _snapshotId) internal view virtual returns (uint256);
    function _totalSupplyAtSnapshot(uint256 _snapshotID) internal view virtual returns (uint256 totalSupply_);
    function _totalSupplyAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID
    ) internal view virtual returns (uint256 totalSupply_);
    function _totalTokenHoldersAt(uint256 snapshotId) internal view virtual returns (uint256);
    function _valueAt(uint256 snapshotId, Snapshots storage snapshots) internal view virtual returns (bool, uint256);
}
