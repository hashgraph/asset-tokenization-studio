// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ArraysUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/ArraysUpgradeable.sol";
import { CountersUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";

import { snapshotStorage, SnapshotStorage } from "../../storage/AssetStorage.sol";
import { erc1410BasicStorage, erc20Storage } from "../../storage/TokenStorage.sol";
import {
    Snapshots,
    SnapshotsAddress,
    PartitionSnapshots,
    ListOfPartitions
} from "../../facets/features/interfaces/ISnapshots.sol";
import { ISnapshots } from "../../facets/features/interfaces/ISnapshots.sol";
import { LibABAF } from "./LibABAF.sol";
import { LibERC1410 } from "./LibERC1410.sol";
import { LibLock } from "./LibLock.sol";
import { LibHold } from "./LibHold.sol";
import { LibFreeze } from "./LibFreeze.sol";
import { LibClearing } from "./LibClearing.sol";
import { LibPagination } from "../../infrastructure/lib/LibPagination.sol";

/// @title LibSnapshots
/// @notice Leaf library for snapshot management functionality
/// @dev Extracted from SnapshotsStorageWrapper for library-based diamond migration
library LibSnapshots {
    using ArraysUpgradeable for uint256[];
    using CountersUpgradeable for CountersUpgradeable.Counter;

    // ═══════════════════════════════════════════════════════════════════════════════
    // SNAPSHOT CREATION
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Takes a snapshot of the current state
    /// @return snapshotID_ The ID of the new snapshot
    function takeSnapshot() internal returns (uint256 snapshotID_) {
        snapshotID_ = snapshot();
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // SNAPSHOT UPDATES (State-modifying)
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Updates a snapshot if needed
    /// @param snapshots The snapshots storage to update
    /// @param currentValue The current value to snapshot
    function updateSnapshot(Snapshots storage snapshots, uint256 currentValue) internal {
        uint256 currentId = getCurrentSnapshotId();
        if (_lastSnapshotId(snapshots.ids) < currentId) {
            snapshots.ids.push(currentId);
            snapshots.values.push(currentValue);
        }
    }

    /// @notice Updates an address snapshot if needed
    /// @param snapshots The address snapshots storage to update
    /// @param currentValue The current address value to snapshot
    function updateSnapshotAddress(SnapshotsAddress storage snapshots, address currentValue) internal {
        uint256 currentId = getCurrentSnapshotId();
        if (_lastSnapshotId(snapshots.ids) < currentId) {
            snapshots.ids.push(currentId);
            snapshots.values.push(currentValue);
        }
    }

    /// @notice Updates partition snapshots
    /// @param snapshots The snapshots storage to update
    /// @param partitionSnapshots The partition snapshots storage to update
    /// @param currentValueForPartition The current value for the partition
    /// @param partitionIds The partition IDs to snapshot
    function updateSnapshotPartitions(
        Snapshots storage snapshots,
        PartitionSnapshots storage partitionSnapshots,
        uint256 currentValueForPartition,
        bytes32[] memory partitionIds
    ) internal {
        uint256 currentId = getCurrentSnapshotId();
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

    /// @notice Updates ABAF snapshot
    /// @dev Must use getAbaf() (with _zeroToOne) rather than raw storage value,
    ///      so uninitialized ABAF (0) is stored as 1, preventing division-by-zero in _balanceOfAtAdjusted
    function updateAbafSnapshot() internal {
        updateSnapshot(snapshotStorage().abafSnapshots, LibABAF.getAbaf());
    }

    /// @notice Updates decimals snapshot
    function updateDecimalsSnapshot() internal {
        updateSnapshot(snapshotStorage().decimals, erc20Storage().decimals);
    }

    /// @notice Updates total supply snapshot
    function updateAssetTotalSupplySnapshot() internal {
        updateSnapshot(snapshotStorage().totalSupplySnapshots, erc1410BasicStorage().totalSupply);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // ACCOUNT SNAPSHOT UPDATES (Orchestration)
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Update account balance snapshot for a specific partition
    /// @dev Replaces _updateAccountSnapshot(address, bytes32) from SnapshotsStorageWrapper2
    function updateAccountSnapshot(address account, bytes32 partition) internal {
        uint256 currentId = getCurrentSnapshotId();
        if (currentId == 0) return;

        uint256 abafAtSnap = abafAtSnapshot(currentId);
        uint256 abafNow = LibABAF.getAbafAdjustedAt(block.timestamp);

        SnapshotStorage storage ss = snapshotStorage();

        if (abafNow == abafAtSnap) {
            // No ABAF adjustment needed - use raw balances
            updateSnapshot(ss.accountBalanceSnapshots[account], LibERC1410.balanceOf(account));
            updateSnapshotPartitions(
                ss.accountPartitionBalanceSnapshots[account][partition],
                ss.accountPartitionMetadata[account],
                LibERC1410.balanceOfByPartition(partition, account),
                LibERC1410.partitionsOf(account)
            );
            return;
        }

        // ABAF adjustment needed
        uint256 balance = LibABAF.balanceOfAdjustedAt(account, block.timestamp);
        uint256 balanceForPartition = LibABAF.balanceOfByPartitionAdjustedAt(partition, account, block.timestamp);
        uint256 factor = abafNow / abafAtSnap;

        balance /= factor;
        balanceForPartition /= factor;

        updateSnapshot(ss.accountBalanceSnapshots[account], balance);
        updateSnapshotPartitions(
            ss.accountPartitionBalanceSnapshots[account][partition],
            ss.accountPartitionMetadata[account],
            balanceForPartition,
            LibERC1410.partitionsOf(account)
        );
    }

    /// @notice Update locked balance snapshot for an account
    /// @dev Replaces _updateAccountLockedBalancesSnapshot from SnapshotsStorageWrapper2
    function updateAccountLockedBalancesSnapshot(address account, bytes32 partition) internal {
        SnapshotStorage storage ss = snapshotStorage();
        updateSnapshot(ss.accountLockedBalanceSnapshots[account], LibLock.getLockedAmountFor(account));
        updateSnapshot(
            ss.accountPartitionLockedBalanceSnapshots[account][partition],
            LibLock.getLockedAmountForByPartition(partition, account)
        );
    }

    /// @notice Update held balance snapshot for an account
    /// @dev Replaces _updateAccountHeldBalancesSnapshot from SnapshotsStorageWrapper2
    function updateAccountHeldBalancesSnapshot(address account, bytes32 partition) internal {
        SnapshotStorage storage ss = snapshotStorage();
        updateSnapshot(ss.accountHeldBalanceSnapshots[account], LibHold.getHeldAmountFor(account));
        updateSnapshot(
            ss.accountPartitionHeldBalanceSnapshots[account][partition],
            LibHold.getHeldAmountForByPartition(partition, account)
        );
    }

    /// @notice Update frozen balance snapshot for an account
    /// @dev Replaces _updateAccountFrozenBalancesSnapshot from SnapshotsStorageWrapper2
    function updateAccountFrozenBalancesSnapshot(address account, bytes32 partition) internal {
        SnapshotStorage storage ss = snapshotStorage();
        updateSnapshot(ss.accountFrozenBalanceSnapshots[account], LibFreeze.getFrozenTokens(account));
        updateSnapshot(
            ss.accountPartitionFrozenBalanceSnapshots[account][partition],
            LibFreeze.getFrozenTokensByPartition(account, partition)
        );
    }

    /// @notice Update cleared balance snapshot for an account
    /// @dev Replaces _updateAccountClearedBalancesSnapshot from SnapshotsStorageWrapper2
    function updateAccountClearedBalancesSnapshot(address account, bytes32 partition) internal {
        SnapshotStorage storage ss = snapshotStorage();
        updateSnapshot(ss.accountClearedBalanceSnapshots[account], LibClearing.getClearedAmount(account));
        updateSnapshot(
            ss.accountPartitionClearedBalanceSnapshots[account][partition],
            LibClearing.getClearedAmountByPartition(partition, account)
        );
    }

    /// @notice Update total supply snapshot for a partition
    /// @dev Replaces _updateTotalSupplySnapshot from SnapshotsStorageWrapper2
    function updateTotalSupplySnapshot(bytes32 partition) internal {
        SnapshotStorage storage ss = snapshotStorage();
        updateSnapshot(ss.totalSupplySnapshots, erc1410BasicStorage().totalSupply);
        updateSnapshot(
            ss.totalSupplyByPartitionSnapshots[partition],
            erc1410BasicStorage().totalSupplyByPartition[partition]
        );
    }

    /// @notice Update token holder snapshot for a specific account
    /// @dev Replaces _updateTokenHolderSnapshot from SnapshotsStorageWrapper2
    function updateTokenHolderSnapshot(address account) internal {
        updateSnapshotAddress(
            snapshotStorage().tokenHoldersSnapshots[LibERC1410.getTokenHolderIndex(account)],
            account
        );
    }

    /// @notice Update total token holder count snapshot
    /// @dev Replaces _updateTotalTokenHolderSnapshot from SnapshotsStorageWrapper2
    function updateTotalTokenHolderSnapshot() internal {
        updateSnapshot(snapshotStorage().totalTokenHoldersSnapshots, LibERC1410.getTotalTokenHolders());
    }

    /// @notice Internal snapshot creation
    /// @return The new snapshot ID
    function snapshot() internal returns (uint256) {
        snapshotStorage().currentSnapshotId.increment();
        uint256 currentId = getCurrentSnapshotId();
        emit ISnapshots.SnapshotTriggered(currentId);
        return currentId;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // SNAPSHOT QUERIES (View functions)
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Get ABAF value at a specific snapshot
    /// @dev Replaces _abafAtSnapshot from SnapshotsStorageWrapper2
    function abafAtSnapshot(uint256 snapshotId) internal view returns (uint256 abaf_) {
        (bool snapshotted, uint256 value) = valueAt(snapshotId, snapshotStorage().abafSnapshots);
        return snapshotted ? value : LibABAF.getAbafAdjustedAt(block.timestamp);
    }

    /// @notice Gets the value at a specific snapshot
    /// @param snapshotId The snapshot ID to query
    /// @param snapshots The snapshots storage to query
    /// @return found True if value found at snapshot
    /// @return value The value at the snapshot (0 if not found)
    function valueAt(
        uint256 snapshotId,
        Snapshots storage snapshots
    ) internal view returns (bool found, uint256 value) {
        uint256 index;
        (found, index) = indexFor(snapshotId, snapshots.ids);
        return (found, found ? snapshots.values[index] : 0);
    }

    /// @notice Gets the address value at a specific snapshot
    /// @param snapshotId The snapshot ID to query
    /// @param snapshots The address snapshots storage to query
    /// @return found True if value found at snapshot
    /// @return value The address at the snapshot (address(0) if not found)
    function addressValueAt(
        uint256 snapshotId,
        SnapshotsAddress storage snapshots
    ) internal view returns (bool found, address value) {
        uint256 index;
        (found, index) = indexFor(snapshotId, snapshots.ids);
        return (found, found ? snapshots.values[index] : address(0));
    }

    /// @notice Finds the index for a snapshot ID using binary search
    /// @param snapshotId The snapshot ID to find
    /// @param ids The sorted array of snapshot IDs
    /// @return found True if snapshot ID exists
    /// @return index The index in the array (only valid if found is true)
    function indexFor(uint256 snapshotId, uint256[] storage ids) internal view returns (bool found, uint256 index) {
        if (snapshotId == 0) {
            revert ISnapshots.SnapshotIdNull();
        }
        if (snapshotId > getCurrentSnapshotId()) {
            revert ISnapshots.SnapshotIdDoesNotExists(snapshotId);
        }

        index = ids.findUpperBound(snapshotId);

        if (index == ids.length) {
            return (false, 0);
        } else {
            return (true, index);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // INTERNAL HELPERS
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Gets the last snapshot ID from a sorted array
    /// @param ids The sorted array of snapshot IDs
    /// @return The last snapshot ID (0 if empty)
    function lastSnapshotId(uint256[] storage ids) internal view returns (uint256) {
        if (ids.length == 0) {
            return 0;
        } else {
            return ids[ids.length - 1];
        }
    }

    /// @notice Gets the current snapshot ID
    /// @return The current snapshot counter value
    function getCurrentSnapshotId() internal view returns (uint256) {
        return snapshotStorage().currentSnapshotId.current();
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // SNAPSHOT AT QUERIES (Historical data access)
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Get total balance of an account at a snapshot
    function totalBalanceOfAtSnapshot(uint256 _snapshotId, address _tokenHolder) internal view returns (uint256) {
        unchecked {
            return
                balanceOfAtSnapshot(_snapshotId, _tokenHolder) +
                clearedBalanceOfAtSnapshot(_snapshotId, _tokenHolder) +
                heldBalanceOfAtSnapshot(_snapshotId, _tokenHolder) +
                lockedBalanceOfAtSnapshot(_snapshotId, _tokenHolder) +
                frozenBalanceOfAtSnapshot(_snapshotId, _tokenHolder);
        }
    }

    /// @notice Get balance of an account at a snapshot
    function balanceOfAtSnapshot(uint256 _snapshotId, address _tokenHolder) internal view returns (uint256) {
        return
            _balanceOfAtAdjusted(
                _snapshotId,
                snapshotStorage().accountBalanceSnapshots[_tokenHolder],
                LibABAF.balanceOfAdjustedAt(_tokenHolder, block.timestamp)
            );
    }

    /// @notice Get cleared balance at snapshot
    function clearedBalanceOfAtSnapshot(uint256 _snapshotId, address _tokenHolder) internal view returns (uint256) {
        return
            _balanceOfAtAdjusted(
                _snapshotId,
                snapshotStorage().accountClearedBalanceSnapshots[_tokenHolder],
                LibClearing.getClearedAmount(_tokenHolder)
            );
    }

    /// @notice Get held balance at snapshot
    function heldBalanceOfAtSnapshot(uint256 _snapshotId, address _tokenHolder) internal view returns (uint256) {
        return
            _balanceOfAtAdjusted(
                _snapshotId,
                snapshotStorage().accountHeldBalanceSnapshots[_tokenHolder],
                LibHold.getHeldAmountFor(_tokenHolder)
            );
    }

    /// @notice Get locked balance at snapshot
    function lockedBalanceOfAtSnapshot(uint256 _snapshotId, address _tokenHolder) internal view returns (uint256) {
        return
            _balanceOfAtAdjusted(
                _snapshotId,
                snapshotStorage().accountLockedBalanceSnapshots[_tokenHolder],
                LibLock.getLockedAmountFor(_tokenHolder)
            );
    }

    /// @notice Get frozen balance at snapshot
    function frozenBalanceOfAtSnapshot(uint256 _snapshotId, address _tokenHolder) internal view returns (uint256) {
        return
            _balanceOfAtAdjusted(
                _snapshotId,
                snapshotStorage().accountFrozenBalanceSnapshots[_tokenHolder],
                LibFreeze.getFrozenTokens(_tokenHolder)
            );
    }

    /// @notice Get decimals at a snapshot
    function decimalsAtSnapshot(uint256 _snapshotId, uint256 _currentTimestamp) internal view returns (uint8) {
        (bool snapshotted, uint256 value) = valueAt(_snapshotId, snapshotStorage().decimals);
        return snapshotted ? uint8(value) : decimalsAdjustedAt(_currentTimestamp);
    }

    /// @notice Get decimals adjusted at a timestamp (considering pending balance adjustments)
    function decimalsAdjustedAt(uint256 _timestamp) internal view returns (uint8) {
        (, uint8 pendingDecimals) = LibABAF.getPendingAbafAt(_timestamp);
        return erc20Storage().decimals + pendingDecimals;
    }

    /// @notice Get token holders at a snapshot (paginated)
    function tokenHoldersAt(
        uint256 _snapshotId,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (address[] memory holders_) {
        (uint256 start, uint256 end) = LibPagination.getStartAndEnd(_pageIndex, _pageLength);
        holders_ = new address[](LibPagination.getSize(start, end, totalTokenHoldersAt(_snapshotId)));

        for (uint256 i = 0; i < holders_.length; i++) {
            uint256 index = start + i + 1; // tokenHolders 1-indexed
            (bool snapshotted, address value) = addressValueAt(
                _snapshotId,
                snapshotStorage().tokenHoldersSnapshots[index]
            );
            holders_[i] = snapshotted ? value : LibERC1410.getTokenHolder(index);
        }
    }

    /// @notice Get total token holders at a snapshot
    function totalTokenHoldersAt(uint256 _snapshotId) internal view returns (uint256) {
        (bool snapshotted, uint256 value) = valueAt(_snapshotId, snapshotStorage().totalTokenHoldersSnapshots);
        return snapshotted ? value : LibERC1410.getTotalTokenHolders();
    }

    /// @dev Helper for balance-at-snapshot with ABAF de-adjustment
    ///      When no snapshot value exists, the current balance is ABAF-adjusted at the
    ///      current time. To get the balance at the snapshot time, we must de-adjust by
    ///      dividing out the ABAF changes that occurred after the snapshot.
    function _balanceOfAtAdjusted(
        uint256 _snapshotId,
        Snapshots storage _snapshots,
        uint256 _currentValue
    ) private view returns (uint256) {
        (bool snapshotted, uint256 value) = valueAt(_snapshotId, _snapshots);
        if (snapshotted) return value;

        uint256 abafSnapshot = abafAtSnapshot(_snapshotId);
        uint256 abafCurrent = LibABAF.getAbafAdjustedAt(block.timestamp);

        if (abafSnapshot == abafCurrent) return _currentValue;

        uint256 factor = abafCurrent / abafSnapshot;

        return _currentValue / factor;
    }

    /// @notice Gets the last snapshot ID from a sorted array (private version)
    /// @param ids The sorted array of snapshot IDs
    /// @return The last snapshot ID (0 if empty)
    function _lastSnapshotId(uint256[] storage ids) private view returns (uint256) {
        if (ids.length == 0) {
            return 0;
        } else {
            return ids[ids.length - 1];
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // STORAGE ACCESSORS FOR FACETS (Encapsulated storage access)
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Get decimals snapshot storage (for passing to valueAt)
    function getDecimalsSnapshots() internal view returns (Snapshots storage) {
        return snapshotStorage().decimals;
    }

    /// @notice Get account balance snapshots storage (for passing to valueAt)
    function getAccountBalanceSnapshots(address _tokenHolder) internal view returns (Snapshots storage) {
        return snapshotStorage().accountBalanceSnapshots[_tokenHolder];
    }

    /// @notice Get account partition balance snapshots storage
    function getAccountPartitionBalanceSnapshots(
        address _tokenHolder,
        bytes32 _partition
    ) internal view returns (Snapshots storage) {
        return snapshotStorage().accountPartitionBalanceSnapshots[_tokenHolder][_partition];
    }

    /// @notice Get account partition metadata (for partitions list at snapshot)
    function getAccountPartitionMetadata(address _tokenHolder) internal view returns (PartitionSnapshots storage) {
        return snapshotStorage().accountPartitionMetadata[_tokenHolder];
    }

    /// @notice Get total supply snapshots storage
    function getTotalSupplySnapshots() internal view returns (Snapshots storage) {
        return snapshotStorage().totalSupplySnapshots;
    }

    /// @notice Get total supply by partition snapshots storage
    function getTotalSupplyByPartitionSnapshots(bytes32 _partition) internal view returns (Snapshots storage) {
        return snapshotStorage().totalSupplyByPartitionSnapshots[_partition];
    }

    /// @notice Get account locked balance snapshots storage
    function getAccountLockedBalanceSnapshots(address _tokenHolder) internal view returns (Snapshots storage) {
        return snapshotStorage().accountLockedBalanceSnapshots[_tokenHolder];
    }

    /// @notice Get account partition locked balance snapshots storage
    function getAccountPartitionLockedBalanceSnapshots(
        address _tokenHolder,
        bytes32 _partition
    ) internal view returns (Snapshots storage) {
        return snapshotStorage().accountPartitionLockedBalanceSnapshots[_tokenHolder][_partition];
    }

    /// @notice Get account held balance snapshots storage
    function getAccountHeldBalanceSnapshots(address _tokenHolder) internal view returns (Snapshots storage) {
        return snapshotStorage().accountHeldBalanceSnapshots[_tokenHolder];
    }

    /// @notice Get account partition held balance snapshots storage
    function getAccountPartitionHeldBalanceSnapshots(
        address _tokenHolder,
        bytes32 _partition
    ) internal view returns (Snapshots storage) {
        return snapshotStorage().accountPartitionHeldBalanceSnapshots[_tokenHolder][_partition];
    }

    /// @notice Get account cleared balance snapshots storage
    function getAccountClearedBalanceSnapshots(address _tokenHolder) internal view returns (Snapshots storage) {
        return snapshotStorage().accountClearedBalanceSnapshots[_tokenHolder];
    }

    /// @notice Get account partition cleared balance snapshots storage
    function getAccountPartitionClearedBalanceSnapshots(
        address _tokenHolder,
        bytes32 _partition
    ) internal view returns (Snapshots storage) {
        return snapshotStorage().accountPartitionClearedBalanceSnapshots[_tokenHolder][_partition];
    }

    /// @notice Get account frozen balance snapshots storage
    function getAccountFrozenBalanceSnapshots(address _tokenHolder) internal view returns (Snapshots storage) {
        return snapshotStorage().accountFrozenBalanceSnapshots[_tokenHolder];
    }

    /// @notice Get account partition frozen balance snapshots storage
    function getAccountPartitionFrozenBalanceSnapshots(
        address _tokenHolder,
        bytes32 _partition
    ) internal view returns (Snapshots storage) {
        return snapshotStorage().accountPartitionFrozenBalanceSnapshots[_tokenHolder][_partition];
    }

    /// @notice Get token holders snapshots storage at index
    function getTokenHolderSnapshots(uint256 _index) internal view returns (SnapshotsAddress storage) {
        return snapshotStorage().tokenHoldersSnapshots[_index];
    }

    /// @notice Get ABAF snapshots storage
    function getAbafSnapshots() internal view returns (Snapshots storage) {
        return snapshotStorage().abafSnapshots;
    }

    /// @notice Get total token holders snapshots storage
    function getTotalTokenHoldersSnapshots() internal view returns (Snapshots storage) {
        return snapshotStorage().totalTokenHoldersSnapshots;
    }
}
