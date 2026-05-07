// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ITransferAndLockTypes } from "../layer_3/transferAndLock/ITransferAndLockTypes.sol";

/**
 * @title  ITransferAndLockByPartition
 * @notice Interface for the partition-aware combined transfer-and-lock operation.
 * @dev    Exposes `transferAndLockByPartition`, which atomically transfers tokens
 *         from the caller's balance on a specified partition to a recipient and
 *         records a timed lock on the recipient's resulting balance.
 *         Inherits `PartitionTransferredAndLocked` from `ITransferAndLockTypes`.
 * @author Asset Tokenization Studio Team
 */
interface ITransferAndLockByPartition is ITransferAndLockTypes {
    /**
     * @notice Transfers `_amount` tokens from the caller's `_partition` balance to
     *         `_to` and locks them until `_expirationTimestamp`.
     * @dev    Callers must hold `LOCKER_ROLE`. The token must be unpaused and
     *         `_expirationTimestamp` must be in the future. In single-partition mode
     *         only the default partition is permitted; protected partitions require
     *         the wildcard role. Emits `PartitionTransferredAndLocked`,
     *         `TransferByPartition` (via `ERC1410StorageWrapper`), and `Transfer`
     *         (via `ERC1410StorageWrapper`).
     * @param _partition           The partition from which tokens are transferred and
     *                             locked.
     * @param _to                  The recipient of the transferred and locked tokens.
     * @param _amount              The amount of tokens to transfer and lock.
     * @param _data                Additional data forwarded to the recipient.
     * @param _expirationTimestamp Unix timestamp until which the transferred tokens
     *                             are locked.
     * @return success_  True when the transfer and lock have been recorded.
     * @return lockId_   Identifier assigned to the resulting lock for
     *                   `(_partition, _to)`.
     */
    function transferAndLockByPartition(
        bytes32 _partition,
        address _to,
        uint256 _amount,
        bytes calldata _data,
        uint256 _expirationTimestamp
    ) external returns (bool success_, uint256 lockId_);
}
