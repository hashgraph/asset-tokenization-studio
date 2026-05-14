// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ITransferAndLockByPartition } from "./ITransferAndLockByPartition.sol";
import { LOCKER_ROLE } from "../../constants/roles.sol";
import { IERC1410Types } from "../layer_1/ERC1400/ERC1410/IERC1410Types.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { ERC1410StorageWrapper } from "../../domain/asset/ERC1410StorageWrapper.sol";
import { LockStorageWrapper } from "../../domain/asset/LockStorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { TokenCoreOps } from "../../domain/orchestrator/TokenCoreOps.sol";

/**
 * @title  TransferAndLockByPartition
 * @notice Abstract implementation of `ITransferAndLockByPartition`.
 * @dev    Delegates the ERC-1410 transfer to
 *         `ERC1410StorageWrapper.transferByPartition` and the lock recording to
 *         `LockStorageWrapper.lockByPartition`. Access is restricted via
 *         `onlyUnpaused`, `onlyRole(LOCKER_ROLE)`,
 *         `onlyWithValidExpirationTimestamp`, `onlyDefaultPartitionWithSinglePartition`,
 *         and `onlyUnProtectedPartitionsOrWildCardRole`. Intended to be inherited
 *         solely by `TransferAndLockByPartitionFacet`.
 * @author Asset Tokenization Studio Team
 */
abstract contract TransferAndLockByPartition is ITransferAndLockByPartition, Modifiers {
    /**
     * @inheritdoc ITransferAndLockByPartition
     * @dev Emits `PartitionTransferredAndLocked` directly after the transfer and
     *      lock succeed. `TransferByPartition` and `Transfer` are emitted inside
     *      `ERC1410StorageWrapper.transferByPartition`.
     */
    function transferAndLockByPartition(
        bytes32 _partition,
        address _to,
        uint256 _amount,
        bytes calldata _data,
        uint256 _expirationTimestamp
    )
        external
        override
        onlyActivated
        onlyUnpaused
        onlyRole(LOCKER_ROLE)
        onlyWithValidExpirationTimestamp(_expirationTimestamp)
        onlyDefaultPartitionWithSinglePartition(_partition)
        onlyUnProtectedPartitionsOrWildCardRole
        returns (bool success_, uint256 lockId_)
    {
        TokenCoreOps.transferByPartition(
            EvmAccessors.getMsgSender(),
            IERC1410Types.BasicTransferInfo(_to, _amount),
            _partition,
            _data,
            EvmAccessors.getMsgSender(),
            ""
        );
        (success_, lockId_) = LockStorageWrapper.lockByPartition(
            _partition,
            _amount,
            _to,
            _expirationTimestamp,
            EvmAccessors.getMsgSender()
        );
        emit PartitionTransferredAndLocked(
            _partition,
            EvmAccessors.getMsgSender(),
            _to,
            _amount,
            _data,
            _expirationTimestamp,
            lockId_
        );
    }
}
