// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

interface ITransferAndLock {
    event TransferByPartition(
        bytes32 indexed partition,
        address indexed from,
        address indexed to,
        uint256 value,
        bytes data
    );

    event RedeemedByPartition(
        bytes32 indexed partition,
        address indexed from,
        address indexed to,
        uint256 value,
        bytes data
    );

    event PartitionTransferredAndLocked(
        bytes32 indexed partition,
        address indexed from,
        address to,
        uint256 value,
        bytes data,
        uint256 expirationTimestamp,
        uint256 lockId
    );

    function transferAndLockByPartition(bytes32 _partition, address _to, uint256 _amount, bytes calldata _data, uint256 _expirationTimestamp) external returns (bool success_, uint256 lockId_);
    function transferAndLock(address _to, uint256 _amount, bytes calldata _data, uint256 _expirationTimestamp) external returns (bool success_, uint256 lockId_);
}
