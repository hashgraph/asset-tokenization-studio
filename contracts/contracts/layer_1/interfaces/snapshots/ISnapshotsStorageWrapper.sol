// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.18;

interface ISnapshotsStorageWrapper {
    // Events
    event SnapshotTaken(address indexed operator, uint256 indexed snapshotID);

    error SnapshotIdNull();
    error SnapshotIdDoesNotExists(uint256 snapshotId);
}
