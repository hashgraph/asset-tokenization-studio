// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.18;

import {
    ArraysUpgradeable
} from '@openzeppelin/contracts-upgradeable/utils/ArraysUpgradeable.sol';
import {
    CountersUpgradeable
} from '@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol';
import {
    ERC1410ControllerStorageWrapper
} from '../ERC1400/ERC1410/ERC1410ControllerStorageWrapper.sol';
import {
    ISnapshotsStorageWrapper
} from '../interfaces/snapshots/ISnapshotsStorageWrapper.sol';
import {_SNAPSHOT_STORAGE_POSITION} from '../constants/storagePositions.sol';

abstract contract SnapshotsStorageWrapper is
    ISnapshotsStorageWrapper,
    ERC1410ControllerStorageWrapper
{
    using ArraysUpgradeable for uint256[];
    using CountersUpgradeable for CountersUpgradeable.Counter;

    // Snapshotted values have arrays of ids and the value corresponding to that id. These could be an array of a
    // Snapshot struct, but that would impede usage of functions that work on an array.
    struct Snapshots {
        uint256[] ids;
        uint256[] values;
    }

    struct ListOfPartitions {
        bytes32[] partitions;
    }
    struct PartitionSnapshots {
        uint256[] ids;
        ListOfPartitions[] values;
    }

    struct SnapshotStorage {
        mapping(address => Snapshots) accountBalanceSnapshots;
        mapping(address => mapping(bytes32 => Snapshots)) accountPartitionBalanceSnapshots;
        mapping(address => PartitionSnapshots) accountPartitionSnapshots;
        Snapshots totalSupplySnapshots;
        // Snapshot ids increase monotonically, with the first value being 1. An id of 0 is invalid.
        CountersUpgradeable.Counter currentSnapshotId;
    }

    event SnapshotTriggered(address indexed operator, uint256 snapshotId);

    function _takeSnapshot() internal virtual returns (uint256 snapshotID_) {
        snapshotID_ = _snapshot();
        emit SnapshotTaken(_msgSender(), snapshotID_);
    }

    function _balanceOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) internal view virtual returns (uint256 balance_) {
        return _balanceOfAt(_tokenHolder, _snapshotID);
    }

    function _balanceOfAtSnapshotByPartition(
        bytes32 _partition,
        uint256 _snapshotID,
        address _tokenHolder
    ) internal view virtual returns (uint256 balance_) {
        return _balanceOfAtByPartition(_partition, _tokenHolder, _snapshotID);
    }

    function _partitionsOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) internal view virtual returns (bytes32[] memory) {
        PartitionSnapshots storage partitionSnapshots = _snapshotStorage()
            .accountPartitionSnapshots[_tokenHolder];

        (bool found, uint256 index) = _indexFor(
            _snapshotID,
            partitionSnapshots.ids
        );

        if (!found) {
            return _partitionsOf(_tokenHolder);
        }

        return partitionSnapshots.values[index].partitions;
    }

    function _totalSupplyAtSnapshot(
        uint256 _snapshotID
    ) internal view virtual returns (uint256 totalSupply_) {
        return _totalSupplyAt(_snapshotID);
    }

    function _snapshot() internal virtual returns (uint256) {
        _snapshotStorage().currentSnapshotId.increment();

        uint256 currentId = _getCurrentSnapshotId();

        emit SnapshotTriggered(_msgSender(), currentId);

        return currentId;
    }

    function _getCurrentSnapshotId() internal view virtual returns (uint256) {
        return _snapshotStorage().currentSnapshotId.current();
    }

    // Update balance and/or total supply snapshots before the values are modified. This is implemented
    // in the _beforeTokenTransfer hook, which is executed for _mint, _burn, and _transfer operations.

    function _updateAccountSnapshot(
        address account,
        bytes32 partition
    ) internal virtual {
        _updateSnapshot(
            _snapshotStorage().accountBalanceSnapshots[account],
            _balanceOf(account)
        );
        _updateSnapshotPartitions(
            _snapshotStorage().accountPartitionBalanceSnapshots[account][
                partition
            ],
            _snapshotStorage().accountPartitionSnapshots[account],
            _balanceOfByPartition(partition, account),
            _partitionsOf(account)
        );
    }

    function _updateTotalSupplySnapshot() internal virtual {
        _updateSnapshot(
            _snapshotStorage().totalSupplySnapshots,
            _totalSupply()
        );
    }

    function _updateSnapshot(
        Snapshots storage snapshots,
        uint256 currentValue
    ) internal virtual {
        uint256 currentId = _getCurrentSnapshotId();
        if (_lastSnapshotId(snapshots.ids) < currentId) {
            snapshots.ids.push(currentId);
            snapshots.values.push(currentValue);
        }
    }

    function _updateSnapshotPartitions(
        Snapshots storage snapshots,
        PartitionSnapshots storage partitionSnapshots,
        uint256 currentValueForPartition,
        // There is a limitation in the number of partitions an account can have, if it has to many the snapshot
        // transaction will run out of gas
        bytes32[] memory partitionIds
    ) internal virtual {
        uint256 currentId = _getCurrentSnapshotId();
        if (_lastSnapshotId(snapshots.ids) < currentId) {
            snapshots.ids.push(currentId);
            snapshots.values.push(currentValueForPartition);
        }
        if (_lastSnapshotId(partitionSnapshots.ids) < currentId) {
            partitionSnapshots.ids.push(currentId);
            ListOfPartitions memory listOfPartitions = ListOfPartitions(
                partitionIds
            );
            partitionSnapshots.values.push(listOfPartitions);
        }
    }

    /**
     * @dev Retrieves the balance of `account` at the time `snapshotId` was created.
     */
    function _balanceOfAt(
        address account,
        uint256 snapshotId
    ) internal view virtual returns (uint256) {
        (bool snapshotted, uint256 value) = _valueAt(
            snapshotId,
            _snapshotStorage().accountBalanceSnapshots[account]
        );

        return snapshotted ? value : _balanceOf(account);
    }

    /**
     * @dev Retrieves the balance of `account` for 'partition' at the time `snapshotId` was created.
     */
    function _balanceOfAtByPartition(
        bytes32 _partition,
        address account,
        uint256 snapshotId
    ) internal view virtual returns (uint256) {
        (bool snapshotted, uint256 value) = _valueAt(
            snapshotId,
            _snapshotStorage().accountPartitionBalanceSnapshots[account][
                _partition
            ]
        );

        return snapshotted ? value : _balanceOfByPartition(_partition, account);
    }

    /**
     * @dev Retrieves the total supply at the time `snapshotId` was created.
     */
    function _totalSupplyAt(
        uint256 snapshotId
    ) internal view virtual returns (uint256) {
        (bool snapshotted, uint256 value) = _valueAt(
            snapshotId,
            _snapshotStorage().totalSupplySnapshots
        );

        return snapshotted ? value : _totalSupply();
    }

    function _valueAt(
        uint256 snapshotId,
        Snapshots storage snapshots
    ) internal view virtual returns (bool, uint256) {
        (bool found, uint256 index) = _indexFor(snapshotId, snapshots.ids);

        return (found, found ? snapshots.values[index] : 0);
    }

    function _indexFor(
        uint256 snapshotId,
        uint256[] storage ids
    ) internal view virtual returns (bool, uint256) {
        if (snapshotId == 0) {
            revert SnapshotIdNull();
        }
        if (snapshotId > _getCurrentSnapshotId()) {
            revert SnapshotIdDoesNotExists(snapshotId);
        }

        uint256 index = ids.findUpperBound(snapshotId);

        if (index == ids.length) {
            return (false, 0);
        } else {
            return (true, index);
        }
    }

    function _lastSnapshotId(
        uint256[] storage ids
    ) internal view virtual returns (uint256) {
        if (ids.length == 0) {
            return 0;
        } else {
            return ids[ids.length - 1];
        }
    }

    function _snapshotStorage()
        internal
        pure
        virtual
        returns (SnapshotStorage storage snapshotStorage_)
    {
        bytes32 position = _SNAPSHOT_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            snapshotStorage_.slot := position
        }
    }
}
