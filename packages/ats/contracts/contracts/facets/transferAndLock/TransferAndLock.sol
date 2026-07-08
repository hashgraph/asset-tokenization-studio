// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { DEFAULT_PARTITION } from "../../constants/values.sol";
import { ROLE_LOCKER } from "../../constants/roles.sol";
import { ITransferAndLock } from "./ITransferAndLock.sol";
import { IERC1410Types } from "../commonTypes/IERC1410Types.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { LockStorageWrapper } from "../../domain/asset/LockStorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { TokenCoreOps } from "../../domain/orchestrator/TokenCoreOps.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";

/**
 * @title TransferAndLock
 * @notice Provides default-partition transfer and lock operations for security tokens.
 * @dev Implements `ITransferAndLock` for tokens without multi-partition support. Transfers
 *      tokens through `TokenCoreOps` before creating a lock in `LockStorageWrapper`, so the
 *      transfer must succeed before any lock state is written. Intended for diamond facet use.
 * @author Asset Tokenization Studio Team
 */
abstract contract TransferAndLock is ITransferAndLock, Modifiers {
    /// @inheritdoc ITransferAndLock
    function initializeTransferAndLock()
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyFacetNotRegistered(_transferAndLockInitializerKey())
    {
        InitializerStorageWrapper.setFacetToReady(_transferAndLockInitializerKey());
        emit TransferAndLockInitialized();
    }

    /// @inheritdoc ITransferAndLock
    function transferAndLock(
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
        onlyWithoutMultiPartition
        onlyUnProtectedPartitionsOrWildCardRole
        returns (uint256 lockId_)
    {
        TokenCoreOps.transferByPartition(
            EvmAccessors.getMsgSender(),
            IERC1410Types.BasicTransferInfo(_to, _amount),
            DEFAULT_PARTITION,
            _data,
            EvmAccessors.getMsgSender(),
            ""
        );
        lockId_ = LockStorageWrapper.lockByPartition(
            DEFAULT_PARTITION,
            _amount,
            _to,
            _expirationTimestamp,
            EvmAccessors.getMsgSender()
        );
        emit PartitionTransferredAndLocked(
            DEFAULT_PARTITION,
            EvmAccessors.getMsgSender(),
            _to,
            _amount,
            _data,
            _expirationTimestamp,
            lockId_
        );
    }

    /**
     * @notice Returns the unique initialisation key for this transfer-and-lock facet.
     * @dev Implementations must return a stable key used to prevent repeated facet
     *      initialisation.
     * @return The resolver key used by `InitializerStorageWrapper` for this facet.
     */
    function _transferAndLockInitializerKey() internal view virtual returns (bytes32);
}
