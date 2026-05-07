// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title  ITransferAndLock
 * @notice Interface for the default-partition combined transfer-and-lock operation.
 * @dev    Exposes `transferAndLock`, which atomically transfers tokens from the
 *         caller's default-partition balance to a recipient and records a timed
 *         lock on the recipient's resulting balance. Only available when
 *         multi-partition mode is disabled.
 * @author Asset Tokenization Studio Team
 */
interface ITransferAndLock {
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
    /**
     * @notice Transfers `_amount` tokens from the caller's default-partition balance
     *         to `_to` and locks them until `_expirationTimestamp`.
     * @dev    Only available when the token is not configured in multi-partition mode
     *         (`onlyWithoutMultiPartition`). Callers must hold `LOCKER_ROLE`. The
     *         token must be unpaused and `_expirationTimestamp` must be in the future.
     *         Protected partitions require the wildcard role. Emits
     *         `PartitionTransferredAndLocked`, `TransferByPartition` (via
     *         `ERC1410StorageWrapper`), and `Transfer` (via `ERC1410StorageWrapper`).
     * @param _to                  The recipient of the transferred and locked tokens.
     * @param _amount              The amount of tokens to transfer and lock.
     * @param _data                Additional data forwarded to the recipient.
     * @param _expirationTimestamp Unix timestamp until which the transferred tokens
     *                             are locked.
     * @return success_  True when the transfer and lock have been recorded.
     * @return lockId_   Identifier assigned to the resulting lock for
     *                   `(_DEFAULT_PARTITION, _to)`.
     */
    function transferAndLock(
        address _to,
        uint256 _amount,
        bytes calldata _data,
        uint256 _expirationTimestamp
    ) external returns (bool success_, uint256 lockId_);
}
