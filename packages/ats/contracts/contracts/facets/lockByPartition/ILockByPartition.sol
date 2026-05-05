// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ILockTypes } from "../layer_1/lock/ILockTypes.sol";

/**
 * @title ILockByPartition
 * @author Asset Tokenization Studio Team
 * @notice Interface for partition-aware token lock operations and partition-scoped read queries.
 * @dev Aggregates the partition-aware write methods (`lockByPartition`, `releaseByPartition`)
 *      and the partition-scoped read methods (`getLockedAmountForByPartition`,
 *      `getLockCountForByPartition`, `getLocksIdForByPartition`, `getLockForByPartition`)
 *      into a single interface separate from the default-partition `ILock` surface.
 *      Inherits `ILockTypes` for the shared `LockData` struct, events and errors.
 */
interface ILockByPartition is ILockTypes {
    /**
     * @notice Locks a certain amount of tokens held by a tokenHolder, until the expirationTimestamp.
     * @param _partition The partition to lock the tokens from.
     * @param _amount The amount of tokens to be locked.
     * @param _tokenHolder The address of the token holder.
     * @param _expirationTimestamp The timestamp when the lock expires.
     * @return success_ Boolean indicating success.
     * @return lockId_ The created lock identifier.
     */
    function lockByPartition(
        bytes32 _partition,
        uint256 _amount,
        address _tokenHolder,
        uint256 _expirationTimestamp
    ) external returns (bool success_, uint256 lockId_);

    /**
     * @notice Releases a certain lock previously created with `lockByPartition`.
     * @param _partition The partition to release the lock from.
     * @param _lockId The id of the lock to be released.
     * @param _tokenHolder The address of the token holder.
     * @return success_ Boolean indicating success.
     */
    function releaseByPartition(
        bytes32 _partition,
        uint256 _lockId,
        address _tokenHolder
    ) external returns (bool success_);

    /**
     * @notice Returns the total amount of tokens currently locked for a specific partition and token holder.
     * @param _partition The partition to query.
     * @param _tokenHolder The address of the token holder.
     * @return amount_ The total locked amount on the given partition.
     */
    function getLockedAmountForByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) external view returns (uint256 amount_);

    /**
     * @notice Returns the number of locks for a specific partition and token holder.
     * @param _partition The partition to query.
     * @param _tokenHolder The address of the token holder.
     * @return lockCount_ The number of locks on the given partition.
     */
    function getLockCountForByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) external view returns (uint256 lockCount_);

    /**
     * @notice Returns the list of lock IDs for a specific partition and token holder.
     * @param _partition The partition to query.
     * @param _tokenHolder The address of the token holder.
     * @param _pageIndex The zero-based index of the page to retrieve.
     * @param _pageLength The maximum number of lock IDs to return.
     * @return locksId_ The array of lock IDs for the given page.
     */
    function getLocksIdForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (uint256[] memory locksId_);

    /**
     * @notice Returns the details of a specific lock for a specific partition and token holder.
     * @param _partition The partition to query.
     * @param _tokenHolder The address of the token holder.
     * @param _lockId The id of the lock to be queried.
     * @return amount_ The amount of tokens locked.
     * @return expirationTimestamp_ The expiration timestamp of the lock.
     */
    function getLockForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _lockId
    ) external view returns (uint256 amount_, uint256 expirationTimestamp_);
}
