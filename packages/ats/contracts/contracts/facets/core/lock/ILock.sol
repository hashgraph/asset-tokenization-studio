// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

interface ILock {
    error WrongExpirationTimestamp();

    // solhint-disable-next-line ordering
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

    /**
     * @dev Locks a certain amount of tokens held by a tokenHolder, until the expirationTimestamp
     * @param _partition The partition to lock the tokens from
     * @param _amount The amount of tokens to be locked
     * @param _tokenHolder The address of the token holder
     * @param _expirationTimestamp The timestamp when the lock expires
     */
    function lockByPartition(
        bytes32 _partition,
        uint256 _amount,
        address _tokenHolder,
        uint256 _expirationTimestamp
    ) external returns (bool success_, uint256 lockId_);

    /**
     * @dev Releases a certain lock previously created with lockByPartition
     * @param _partition The partition to release the lock from
     * @param _lockId The id of the lock to be released
     * @param _tokenHolder The address of the token holder
     */
    function releaseByPartition(
        bytes32 _partition,
        uint256 _lockId,
        address _tokenHolder
    ) external returns (bool success_);

    /**
     * @dev Lock, defaulting to the default partition
     * @param _amount The amount of tokens to be locked
     * @param _tokenHolder The address of the token holder
     * @param _expirationTimestamp The timestamp when the lock expires
     */
    function lock(
        uint256 _amount,
        address _tokenHolder,
        uint256 _expirationTimestamp
    ) external returns (bool success_, uint256 lockId_);

    /**
     * @dev Releases a certain lock previously created with lock
     * @param _lockId The id of the lock to be released
     * @param _tokenHolder The address of the token holder
     */
    function release(uint256 _lockId, address _tokenHolder) external returns (bool success_);

    /**
     * @dev Returns the total amount of tokens currently locked for a specific partition and token holder
     * @param _partition The partition to query
     * @param _tokenHolder The address of the token holder
     */
    function getLockedAmountForByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) external view returns (uint256 amount_);

    /**
     * @dev Returns the number of locks for a specific partition and token holder
     * @param _partition The partition to query
     * @param _tokenHolder The address of the token holder
     */
    function getLockCountForByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) external view returns (uint256 lockCount_);

    /**
     * @dev Returns the list of lock IDs for a specific partition and token holder
     * @param _partition The partition to query
     * @param _tokenHolder The address of the token holder
     * @param _pageIndex The index of the page to retrieve
     * @param _pageLength The length of the page to retrieve
     */
    function getLocksIdForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (uint256[] memory locksId_);

    /**
     * @dev Returns the details of a specific lock for a specific partition and token holder
     * @param _partition The partition to query
     * @param _tokenHolder The address of the token holder
     * @param _lockId The id of the lock to be queried
     */
    function getLockForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _lockId
    ) external view returns (uint256 amount_, uint256 expirationTimestamp_);

    /**
     * @dev Returns the total amount of tokens currently locked for a token holder (all partitions)
     * @param _tokenHolder The address of the token holder
     */
    function getLockedAmountFor(address _tokenHolder) external view returns (uint256 amount_);

    /**
     * @dev Returns the number of locks for a token holder (all partitions)
     * @param _tokenHolder The address of the token holder
     */
    function getLockCountFor(address _tokenHolder) external view returns (uint256 lockCount_);

    /**
     * @dev Returns the list of lock IDs for a token holder (all partitions)
     * @param _tokenHolder The address of the token holder
     * @param _pageIndex The index of the page to retrieve
     * @param _pageLength The length of the page to retrieve
     */
    function getLocksIdFor(
        address _tokenHolder,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (uint256[] memory locksId_);

    /**
     * @dev Returns the details of a specific lock for a token holder (all partitions)
     * @param _tokenHolder The address of the token holder
     * @param _lockId The id of the lock to be queried
     */
    function getLockFor(
        address _tokenHolder,
        uint256 _lockId
    ) external view returns (uint256 amount_, uint256 expirationTimestamp_);
}
