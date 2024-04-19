// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

interface ILockStorageWrapper {
    event LockedByPartition(
        address indexed operator,
        address indexed tokenHolder,
        bytes32 indexed partition,
        uint256 lockId,
        uint256 amount,
        uint256 expirationTimestamp
    );

    event LockByPartitionReleased(
        address indexed operator,
        address indexed tokenHolder,
        bytes32 indexed partition,
        uint256 lockId
    );

    error LockExpirationNotReached();
    error WrongLockId();
    error WrongExpirationTimestamp();
}
