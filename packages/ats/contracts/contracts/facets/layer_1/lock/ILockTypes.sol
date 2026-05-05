// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title ILockTypes
 * @author Asset Tokenization Studio Team
 * @notice Single source of truth for all Lock domain types (struct, events, errors).
 * @dev Shared between `ILock` (default-partition surface) and `ILockByPartition`
 *      (partition-aware surface) so both interfaces expose the same `LockData` shape and
 *      emit identical event signatures.
 */
interface ILockTypes {
    struct LockData {
        uint256 id;
        uint256 amount;
        uint256 expirationTimestamp;
    }

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
}
