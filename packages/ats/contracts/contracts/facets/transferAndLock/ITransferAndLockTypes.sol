// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title  ITransferAndLockTypes
 * @author Asset Tokenization Studio Team
 * @notice Shared event for the TransferAndLock facet family.
 * @dev    Both `ITransferAndLock` and `ITransferAndLockByPartition` inherit this
 *         interface so that `PartitionTransferredAndLocked` is available to all
 *         implementations without duplication. Mirrors the `ILockTypes` pattern.
 */
interface ITransferAndLockTypes {
    /**
     * @notice Emitted when tokens are transferred to a recipient on a partition and
     *         locked until a future timestamp.
     * @param partition           The partition on which the transfer and lock occurred.
     * @param from                The address from which tokens were transferred.
     * @param to                  The address to which tokens were transferred and locked.
     * @param value               The amount of tokens transferred and locked.
     * @param data                Additional data provided by the caller.
     * @param expirationTimestamp Unix timestamp at which the lock expires.
     * @param lockId              Identifier assigned to the resulting lock.
     */
    event PartitionTransferredAndLocked(
        bytes32 indexed partition,
        address indexed from,
        address to,
        uint256 value,
        bytes data,
        uint256 expirationTimestamp,
        uint256 lockId
    );
}
