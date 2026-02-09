// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "../../storage/ComplexStorage.sol";
import "./LibABAF.sol";     // ← EXPLICIT: record ABAF at snapshot time
import "./LibERC1410.sol";  // ← EXPLICIT: get current holders for snapshot

/// @title LibSnapshots — Balance snapshot management (70 lines of logic)
/// @notice Takes point-in-time snapshots of holder balances.
///
/// @dev COMPOSITION GRAPH:
///   LibSnapshots → LibABAF     (to record ABAF at snapshot time)
///   LibSnapshots → LibERC1410  (to get current holders list)
///   LibERC1410   → LibSnapshots (to update snapshots on transfer)
///
///   This is a CIRCULAR CALL PATTERN: LibSnapshots ↔ LibERC1410
///   ✅ Compiles perfectly with libraries!
///   ❌ Would be IMPOSSIBLE with abstract contract inheritance.
library LibSnapshots {
    error SnapshotDoesNotExist(uint256 snapshotId);
    event SnapshotCreated(uint256 indexed snapshotId);

    /// @dev Creates a new snapshot, recording current ABAF and holders.
    /// COMPOSITION: calls LibABAF.getAbaf() and LibERC1410.getTokenHolders()
    function takeSnapshot() internal returns (uint256) {
        SnapshotStorage storage ss = snapshotStorage();
        ss.currentSnapshotId++;
        uint256 snapshotId = ss.currentSnapshotId;

        // Record ABAF at snapshot time — COMPOSITION with LibABAF
        ss.abafAtSnapshot[snapshotId] = LibABAF.getAbaf();

        // Record current holders — COMPOSITION with LibERC1410
        uint256 holderCount = LibERC1410.tokenHolderCount();
        address[] memory holders = LibERC1410.getTokenHolders(0, holderCount);
        for (uint256 i = 0; i < holders.length; i++) {
            ss.holdersAtSnapshot[snapshotId].push(holders[i]);
            ss.holderExistsAtSnapshot[snapshotId][holders[i]] = true;
        }

        // Snapshot total supply
        ss.totalSupplySnapshots.push(SnapshotEntry({
            snapshotId: snapshotId,
            value: LibERC1410.rawTotalSupply()
        }));

        emit SnapshotCreated(snapshotId);
        return snapshotId;
    }

    /// @dev Updates snapshot for account+partition (called by LibERC1410 on transfer)
    function updateAccountSnapshot(address account, bytes32 partition) internal {
        SnapshotStorage storage ss = snapshotStorage();
        uint256 currentId = ss.currentSnapshotId;
        if (currentId == 0) return;

        uint256 balance = LibERC1410.rawBalanceOfByPartition(partition, account);
        ss.accountPartitionSnapshots[account][partition].push(SnapshotEntry({
            snapshotId: currentId,
            value: balance
        }));
    }

    /// @dev Get balance at a specific snapshot (for coupon calculations)
    function getSnapshotBalanceByPartition(
        uint256 snapshotId, bytes32 partition, address account
    ) internal view returns (uint256) {
        SnapshotStorage storage ss = snapshotStorage();
        if (snapshotId > ss.currentSnapshotId) revert SnapshotDoesNotExist(snapshotId);

        SnapshotEntry[] storage entries = ss.accountPartitionSnapshots[account][partition];
        for (uint256 i = entries.length; i > 0; i--) {
            if (entries[i - 1].snapshotId <= snapshotId) {
                return entries[i - 1].value;
            }
        }
        return LibERC1410.rawBalanceOfByPartition(partition, account);
    }

    function getHoldersAtSnapshot(uint256 snapshotId)
        internal view returns (address[] memory)
    {
        return snapshotStorage().holdersAtSnapshot[snapshotId];
    }

    function getCurrentSnapshotId() internal view returns (uint256) {
        return snapshotStorage().currentSnapshotId;
    }
}
