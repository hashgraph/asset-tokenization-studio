// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

interface ISnapshotsStorageWrapper {
    // Events
    event SnapshotTaken(address indexed operator, uint256 indexed snapshotID);
    event SnapshotTriggered(uint256 snapshotId);
    // Errors
    error SnapshotIdNull();
    error SnapshotIdDoesNotExists(uint256 snapshotId);
}
