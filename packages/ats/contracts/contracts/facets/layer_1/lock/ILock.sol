// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ILockTypes } from "./ILockTypes.sol";

/**
 * @title ILock
 * @author Asset Tokenization Studio Team
 * @notice Interface for default-partition token lock operations and global read queries.
 * @dev Exposes the single-partition write methods (`lock`, `release`) and the global
 *      (all-partition) read methods. Partition-aware methods live in `ILockByPartition`.
 *      Inherits `ILockTypes` for the shared `LockData` struct, events and errors.
 */
interface ILock is ILockTypes {
    /**
     * @notice Lock, defaulting to the default partition.
     * @param _amount The amount of tokens to be locked.
     * @param _tokenHolder The address of the token holder.
     * @param _expirationTimestamp The timestamp when the lock expires.
     * @return success_ Boolean indicating success.
     * @return lockId_ The created lock identifier.
     */
    function lock(
        uint256 _amount,
        address _tokenHolder,
        uint256 _expirationTimestamp
    ) external returns (bool success_, uint256 lockId_);

    /**
     * @notice Releases a certain lock previously created with `lock`.
     * @param _lockId The id of the lock to be released.
     * @param _tokenHolder The address of the token holder.
     * @return success_ Boolean indicating success.
     */
    function release(uint256 _lockId, address _tokenHolder) external returns (bool success_);

    /**
     * @notice Returns the total amount of tokens currently locked for a token holder (all partitions).
     * @param _tokenHolder The address of the token holder.
     * @return amount_ The total locked amount across all partitions.
     */
    function getLockedAmountFor(address _tokenHolder) external view returns (uint256 amount_);

    /**
     * @notice Returns the number of locks for a token holder (all partitions).
     * @param _tokenHolder The address of the token holder.
     * @return lockCount_ The number of locks across all partitions.
     */
    function getLockCountFor(address _tokenHolder) external view returns (uint256 lockCount_);

    /**
     * @notice Returns the list of lock IDs for a token holder (all partitions).
     * @param _tokenHolder The address of the token holder.
     * @param _pageIndex The zero-based index of the page to retrieve.
     * @param _pageLength The maximum number of lock IDs to return.
     * @return locksId_ The array of lock IDs for the given page.
     */
    function getLocksIdFor(
        address _tokenHolder,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (uint256[] memory locksId_);

    /**
     * @notice Returns the details of a specific lock for a token holder (all partitions).
     * @param _tokenHolder The address of the token holder.
     * @param _lockId The id of the lock to be queried.
     * @return amount_ The amount of tokens locked.
     * @return expirationTimestamp_ The expiration timestamp of the lock.
     */
    function getLockFor(
        address _tokenHolder,
        uint256 _lockId
    ) external view returns (uint256 amount_, uint256 expirationTimestamp_);
}
