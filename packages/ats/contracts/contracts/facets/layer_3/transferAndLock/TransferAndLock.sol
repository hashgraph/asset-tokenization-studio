// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _DEFAULT_PARTITION } from "../../../constants/values.sol";
import { ROLE_LOCKER } from "../../../constants/roles.sol";
import { ITransferAndLock } from "./ITransferAndLock.sol";
import { IERC1410Types } from "../../layer_1/ERC1400/ERC1410/IERC1410Types.sol";
import { Modifiers } from "../../../services/Modifiers.sol";
import { ERC1410StorageWrapper } from "../../../domain/asset/ERC1410StorageWrapper.sol";
import { LockStorageWrapper } from "../../../domain/asset/LockStorageWrapper.sol";
import { EvmAccessors } from "../../../infrastructure/utils/EvmAccessors.sol";
import { TokenCoreOps } from "../../../domain/orchestrator/TokenCoreOps.sol";

abstract contract TransferAndLock is ITransferAndLock, Modifiers {
    function transferAndLock(
        address _to,
        uint256 _amount,
        bytes calldata _data,
        uint256 _expirationTimestamp
    )
        external
        override
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
            _DEFAULT_PARTITION,
            _data,
            EvmAccessors.getMsgSender(),
            ""
        );
        lockId_ = LockStorageWrapper.lockByPartition(
            _DEFAULT_PARTITION,
            _amount,
            _to,
            _expirationTimestamp,
            EvmAccessors.getMsgSender()
        );
        emit PartitionTransferredAndLocked(
            _DEFAULT_PARTITION,
            EvmAccessors.getMsgSender(),
            _to,
            _amount,
            _data,
            _expirationTimestamp,
            lockId_
        );
    }
}
