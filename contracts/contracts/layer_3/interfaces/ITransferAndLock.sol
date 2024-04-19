// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

interface ITransferAndLock {
    event PartitionTransferredAndLocked(
        bytes32 indexed partition,
        address indexed from,
        address to,
        uint256 value,
        bytes data,
        uint256 expirationTimestamp,
        uint256 lockId
    );

    function transferAndLockByPartition(
        bytes32 _partition,
        address _to,
        uint256 _amount,
        bytes calldata _data,
        uint256 _expirationTimestamp
    ) external returns (bool success_, uint256 lockId_);

    function transferAndLock(
        address _to,
        uint256 _amount,
        bytes calldata _data,
        uint256 _expirationTimestamp
    ) external returns (bool success_, uint256 lockId_);
}
