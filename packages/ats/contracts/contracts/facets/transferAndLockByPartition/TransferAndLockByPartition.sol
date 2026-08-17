// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    ITransferAndLockByPartition,
    RESOLVER_KEY_TRANSFER_AND_LOCK_BY_PARTITION
} from "./ITransferAndLockByPartition.sol";
import { ROLE_LOCKER, DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { EMPTY_BYTES } from "../../constants/values.sol";
import { IERC1410Types } from "../commonTypes/IERC1410Types.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { LockStorageWrapper } from "../../domain/asset/LockStorageWrapper.sol";
import { ERC1594StorageWrapper } from "../../domain/asset/ERC1594StorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { TokenCoreOps } from "../../domain/orchestrator/TokenCoreOps.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";

/**
 * @title  TransferAndLockByPartition
 * @notice Abstract implementation of `ITransferAndLockByPartition`.
 * @dev    Delegates the ERC-1410 transfer to
 *         `ERC1410StorageWrapper.transferByPartition` and the lock recording to
 *         `LockStorageWrapper.lockByPartition`. Access is restricted via
 *         `onlyUnpaused`, `onlyRole(ROLE_LOCKER)`,
 *         `onlyWithValidExpirationTimestamp`, `onlyDefaultPartitionWithSinglePartition`,
 *         and `onlyUnProtectedPartitionsOrWildCardRole`. Intended to be inherited
 *         solely by `TransferAndLockByPartitionFacet`.
 * @author Asset Tokenization Studio Team
 */
abstract contract TransferAndLockByPartition is ITransferAndLockByPartition, Modifiers {
    /// @inheritdoc ITransferAndLockByPartition
    function initializeTransferAndLockByPartition()
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyFacetNotRegistered(RESOLVER_KEY_TRANSFER_AND_LOCK_BY_PARTITION)
    {
        InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_TRANSFER_AND_LOCK_BY_PARTITION);
        emit TransferAndLockByPartitionInitialized();
    }

    /// @inheritdoc ITransferAndLockByPartition
    function transferAndLockByPartition(
        bytes32 _partition,
        address _to,
        uint256 _amount,
        bytes calldata _data,
        uint256 _expirationTimestamp
    )
        external
        override
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlyRole(ROLE_LOCKER)
        onlyWithValidExpirationTimestamp(_expirationTimestamp)
        onlyDefaultPartitionWithSinglePartition(_partition)
        onlyUnProtectedPartitionsOrWildCardRole
        onlyPositiveTransferAmount(_amount)
        returns (uint256 lockId_)
    {
        {
            ERC1594StorageWrapper.checkCanTransferFromByPartition(
                EvmAccessors.getMsgSender(),
                _to,
                _partition,
                _amount,
                EMPTY_BYTES,
                EMPTY_BYTES
            );
        }
        TokenCoreOps.transferByPartition(
            EvmAccessors.getMsgSender(),
            IERC1410Types.BasicTransferInfo(_to, _amount),
            _partition,
            _data,
            EvmAccessors.getMsgSender(),
            ""
        );
        lockId_ = LockStorageWrapper.lockByPartition(
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
