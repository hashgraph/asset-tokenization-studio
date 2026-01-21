// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    IProtectedPartitionsStorageWrapper
} from "../../layer_1/interfaces/protectedPartitions/IProtectedPartitionsStorageWrapper.sol";

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

}
