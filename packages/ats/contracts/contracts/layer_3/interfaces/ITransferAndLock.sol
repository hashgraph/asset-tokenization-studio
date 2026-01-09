// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

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

    struct TransferAndLockStruct {
        address from;
        address to;
        uint256 amount;
        bytes data;
        uint256 expirationTimestamp;
    }

    /**
     * @notice Transfers tokens to a specified address for a partition and locks them until the expiration timestamp
     * @param _partition The partition from which tokens will be transferred and locked
     * @param _to The address to which tokens will be transferred and locked
     * @param _amount The amount of tokens to be transferred and locked
     * @param _data Additional data with no specified format, sent in call to `_to`
     * @param _expirationTimestamp The timestamp until which the tokens will be locked
     */
    function transferAndLockByPartition(
        bytes32 _partition,
        address _to,
        uint256 _amount,
        bytes calldata _data,
        uint256 _expirationTimestamp
    ) external returns (bool success_, uint256 lockId_);

    /**
     * @notice Transfers tokens to a specified address and locks them until the expiration
     *         timestamp using the default partition
     * @param _to The address to which tokens will be transferred and locked
     * @param _amount The amount of tokens to be transferred and locked
     * @param _data Additional data with no specified format, sent in call to `_to`
     * @param _expirationTimestamp The timestamp until which the tokens will be locked
     */
    function transferAndLock(
        address _to,
        uint256 _amount,
        bytes calldata _data,
        uint256 _expirationTimestamp
    ) external returns (bool success_, uint256 lockId_);

    /**
     * @notice Transfers tokens to a specified address for a partition and locks them until the expiration timestamp
     * @dev Can only be called by an account with the protected partitions role
     * @param _partition The partition from which tokens will be transferred and locked
     * @param _transferAndLockData The struct containing the transfer and lock data
     * @param _deadline The deadline timestamp for the signature to be valid
     * @param _nounce The nounce for the signature to be valid
     * @param _signature The signature of the transfer and lock data
     */
    function protectedTransferAndLockByPartition(
        bytes32 _partition,
        TransferAndLockStruct calldata _transferAndLockData,
        uint256 _deadline,
        uint256 _nounce,
        bytes calldata _signature
    ) external returns (bool success_, uint256 lockId_);

    /**
     * @notice Transfers tokens to a specified address and locks them until the expiration
     *         timestamp using the default partition
     * @dev Can only be called by an account with the protected partitions role
     * @param _transferAndLockData The struct containing the transfer and lock data
     * @param _deadline The deadline timestamp for the signature to be valid
     * @param _nounce The nounce for the signature to be valid
     * @param _signature The signature of the transfer and lock data
     */
    function protectedTransferAndLock(
        TransferAndLockStruct calldata _transferAndLockData,
        uint256 _deadline,
        uint256 _nounce,
        bytes calldata _signature
    ) external returns (bool success_, uint256 lockId_);
}
