// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ArraysUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/ArraysUpgradeable.sol";
import { CountersUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import { _SNAPSHOT_STORAGE_POSITION } from "../constants/storagePositions.sol";
import {
    ISnapshotsStorageWrapper,
    Snapshots,
    SnapshotsAddress,
    PartitionSnapshots,
    ListOfPartitions
} from "../../layer_1/interfaces/snapshots/ISnapshots.sol";
import { CorporateActionsStorageWrapper } from "../corporateActions/CorporateActionsStorageWrapper.sol";
import { EMPTY_BYTES } from "../../layer_0/constants/values.sol";

abstract contract SnapshotsStorageWrapper1 is ISnapshotsStorageWrapper, CorporateActionsStorageWrapper {
    using ArraysUpgradeable for uint256[];
    using CountersUpgradeable for CountersUpgradeable.Counter;

    // Snapshotted values have arrays of ids and the value corresponding to that id. These could be an array of a
    // Snapshot struct, but that would impede usage of functions that work on an array.

    struct SnapshotStorage {
        /// @dev Snapshots for total balances per account
        mapping(address => Snapshots) accountBalanceSnapshots;
        /// @dev Snapshots for balances per account and partition
        mapping(address => mapping(bytes32 => Snapshots)) accountPartitionBalanceSnapshots;
        /// @dev Metadata for partitions associated with each account
        mapping(address => PartitionSnapshots) accountPartitionMetadata;
        /// @dev Snapshots for the total supply
        Snapshots totalSupplySnapshots;
        /// @dev Snapshot ids increase monotonically, with the first value being 1. An id of 0 is invalid.
        /// Unique ID for the current snapshot
        CountersUpgradeable.Counter currentSnapshotId;
        /// @dev Snapshots for locked balances per account
        mapping(address => Snapshots) accountLockedBalanceSnapshots;
        /// @dev Snapshots for locked balances per account and partition
        mapping(address => mapping(bytes32 => Snapshots)) accountPartitionLockedBalanceSnapshots;
        /// @dev Snapshots for the total supply by partition
        mapping(bytes32 => Snapshots) totalSupplyByPartitionSnapshots;
        /// @dev Snapshots for held balances per account
        mapping(address => Snapshots) accountHeldBalanceSnapshots;
        /// @dev Snapshots for held balances per account and partition
        mapping(address => mapping(bytes32 => Snapshots)) accountPartitionHeldBalanceSnapshots;
        /// @dev Snapshots for cleared balances per account
        mapping(address => Snapshots) accountClearedBalanceSnapshots;
        /// @dev Snapshots for cleared balances per account and partition
        mapping(address => mapping(bytes32 => Snapshots)) accountPartitionClearedBalanceSnapshots;
        /// @dev Snapshots for Adjustment Before Adjustment Factor values
        Snapshots abafSnapshots;
        /// @dev Snapshots for decimal precision values
        Snapshots decimals;
        /// @dev Snapshots for frozen balances per account
        mapping(address => Snapshots) accountFrozenBalanceSnapshots;
        /// @dev Snapshots for frozen balances per account and partition
        mapping(address => mapping(bytes32 => Snapshots)) accountPartitionFrozenBalanceSnapshots;
        /// @dev Snapshots of token holders by snapshot ID
        mapping(uint256 => SnapshotsAddress) tokenHoldersSnapshots;
        /// @dev Snapshots for total number of token holders
        Snapshots totalTokenHoldersSnapshots;
    }

    function _takeSnapshot() internal override returns (uint256 snapshotID_) {
        _snapshotStorage().currentSnapshotId.increment();

        return _getCurrentSnapshotId();
    }

    function _updateSnapshot(Snapshots storage snapshots, uint256 currentValue) internal override {
        uint256 currentId = _getCurrentSnapshotId();
        if (_lastSnapshotId(snapshots.ids) < currentId) {
            snapshots.ids.push(currentId);
            snapshots.values.push(currentValue);
        }
    }

    function _updateSnapshotAddress(SnapshotsAddress storage snapshots, address currentValue) internal override {
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
        bytes32[] memory partitionIds
    ) internal override {
        uint256 currentId = _getCurrentSnapshotId();
        if (_lastSnapshotId(snapshots.ids) < currentId) {
            snapshots.ids.push(currentId);
            snapshots.values.push(currentValueForPartition);
        }
        if (_lastSnapshotId(partitionSnapshots.ids) < currentId) {
            partitionSnapshots.ids.push(currentId);
            ListOfPartitions memory listOfPartitions = ListOfPartitions(partitionIds);
            partitionSnapshots.values.push(listOfPartitions);
        }
    }

    function _getCurrentSnapshotId() internal view override returns (uint256) {
        return _snapshotStorage().currentSnapshotId.current();
    }

    function _valueAt(uint256 snapshotId, Snapshots storage snapshots) internal view override returns (bool, uint256) {
        (bool found, uint256 index) = _indexFor(snapshotId, snapshots.ids);

        return (found, found ? snapshots.values[index] : 0);
    }

    function _addressValueAt(
        uint256 snapshotId,
        SnapshotsAddress storage snapshots
    ) internal view override returns (bool, address) {
        (bool found, uint256 index) = _indexFor(snapshotId, snapshots.ids);

        return (found, found ? snapshots.values[index] : address(0));
    }

    function _indexFor(uint256 snapshotId, uint256[] storage ids) internal view override returns (bool, uint256) {
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

    function _lastSnapshotId(uint256[] storage ids) internal view override returns (uint256) {
        if (ids.length == 0) {
            return 0;
        } else {
            return ids[ids.length - 1];
        }
    }

    function _snapshotStorage() internal pure virtual returns (SnapshotStorage storage snapshotStorage_) {
        bytes32 position = _SNAPSHOT_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            snapshotStorage_.slot := position
        }
    }
}
