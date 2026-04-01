// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _DEFAULT_PARTITION } from "../../../constants/values.sol";
import { _LOCKER_ROLE, _WILD_CARD_ROLE } from "../../../constants/roles.sol";
import { ITransferAndLock } from "./ITransferAndLock.sol";
import { BasicTransferInfo } from "../../layer_1/ERC1400/ERC1410/IERC1410.sol";
import { AccessControlStorageWrapper } from "../../../domain/core/AccessControlStorageWrapper.sol";
import { Modifiers } from "../../../services/Modifiers.sol";
import { ProtectedPartitionsStorageWrapper } from "../../../domain/core/ProtectedPartitionsStorageWrapper.sol";
import {
    IProtectedPartitionsStorageWrapper
} from "../../../domain/core/protectedPartition/IProtectedPartitionsStorageWrapper.sol";
import { ERC1410StorageWrapper } from "../../../domain/asset/ERC1410StorageWrapper.sol";
import { LockStorageWrapper } from "../../../domain/asset/LockStorageWrapper.sol";
import { EvmAccessors } from "../../../infrastructure/utils/EvmAccessors.sol";

abstract contract TransferAndLock is ITransferAndLock, Modifiers {
    function transferAndLockByPartition(
        bytes32 _partition,
        address _to,
        uint256 _amount,
        bytes calldata _data,
        uint256 _expirationTimestamp
    )
        external
        override
        onlyUnpaused
        onlyRole(_LOCKER_ROLE)
        onlyWithValidExpirationTimestamp(_expirationTimestamp)
        onlyDefaultPartitionWithSinglePartition(_partition)
        returns (bool success_, uint256 lockId_)
    {
        _requireUnProtectedPartitionsOrWildCardRole();
        ERC1410StorageWrapper.transferByPartition(
            EvmAccessors.getMsgSender(),
            BasicTransferInfo(_to, _amount),
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

    function transferAndLock(
        address _to,
        uint256 _amount,
        bytes calldata _data,
        uint256 _expirationTimestamp
    )
        external
        override
        onlyUnpaused
        onlyRole(_LOCKER_ROLE)
        onlyWithValidExpirationTimestamp(_expirationTimestamp)
        onlyWithoutMultiPartition
        returns (bool success_, uint256 lockId_)
    {
        _requireUnProtectedPartitionsOrWildCardRole();
        ERC1410StorageWrapper.transferByPartition(
            EvmAccessors.getMsgSender(),
            BasicTransferInfo(_to, _amount),
            _DEFAULT_PARTITION,
            _data,
            EvmAccessors.getMsgSender(),
            ""
        );
        (success_, lockId_) = LockStorageWrapper.lockByPartition(
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

    function _requireUnProtectedPartitionsOrWildCardRole() internal view {
        if (
            ProtectedPartitionsStorageWrapper.arePartitionsProtected() &&
            !AccessControlStorageWrapper.hasRole(_WILD_CARD_ROLE, EvmAccessors.getMsgSender())
        ) {
            revert IProtectedPartitionsStorageWrapper.PartitionsAreProtectedAndNoRole(
                EvmAccessors.getMsgSender(),
                _WILD_CARD_ROLE
            );
        }
    }
}
