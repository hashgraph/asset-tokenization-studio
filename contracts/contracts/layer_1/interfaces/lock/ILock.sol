// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

interface ILock {
    function lockByPartition(
        bytes32 _partition,
        uint256 _amount,
        address _tokenHolder,
        uint256 _expirationTimestamp
    ) external returns (bool success_, uint256 lockId_);

    function releaseByPartition(
        bytes32 _partition,
        uint256 _lockId,
        address _tokenHolder
    ) external returns (bool success_);

    function getLockedAmountForByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) external view returns (uint256 amount_);

    function getLockCountForByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) external view returns (uint256 lockCount_);

    function getLocksIdForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (uint256[] memory locksId_);

    function getLockForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _lockId
    ) external view returns (uint256 amount_, uint256 expirationTimestamp_);

    // Uses default parititon in case Multipartition is not activated
    function lock(
        uint256 _amount,
        address _tokenHolder,
        uint256 _expirationTimestamp
    ) external returns (bool success_, uint256 lockId_);

    function release(
        uint256 _lockId,
        address _tokenHolder
    ) external returns (bool success_);

    function getLockedAmountFor(
        address _tokenHolder
    ) external view returns (uint256 amount_);

    function getLockCountFor(
        address _tokenHolder
    ) external view returns (uint256 lockCount_);

    function getLocksIdFor(
        address _tokenHolder,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (uint256[] memory locksId_);

    function getLockFor(
        address _tokenHolder,
        uint256 _lockId
    ) external view returns (uint256 amount_, uint256 expirationTimestamp_);
}
