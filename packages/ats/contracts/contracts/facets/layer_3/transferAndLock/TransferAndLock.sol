// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _DEFAULT_PARTITION } from "../../../constants/values.sol";
import { _LOCKER_ROLE, _WILD_CARD_ROLE } from "../../../constants/roles.sol";
import { ITransferAndLock } from "./ITransferAndLock.sol";
import { BasicTransferInfo } from "../../layer_1/ERC1400/ERC1410/IERC1410.sol";
import { AccessControlStorageWrapper } from "../../../domain/core/AccessControlStorageWrapper.sol";
import { PauseStorageWrapper } from "../../../domain/core/PauseStorageWrapper.sol";
import { ProtectedPartitionsStorageWrapper } from "../../../domain/core/ProtectedPartitionsStorageWrapper.sol";
import {
    IProtectedPartitionsStorageWrapper
} from "../../../domain/core/protectedPartition/IProtectedPartitionsStorageWrapper.sol";
import { ERC1410StorageWrapper } from "../../../domain/asset/ERC1410StorageWrapper.sol";
import { LockStorageWrapper } from "../../../domain/asset/LockStorageWrapper.sol";

abstract contract TransferAndLock is ITransferAndLock {
    function transferAndLockByPartition(
        bytes32 _partition,
        address _to,
        uint256 _amount,
        bytes calldata _data,
        uint256 _expirationTimestamp
    ) external override returns (bool success_, uint256 lockId_) {
        AccessControlStorageWrapper._checkRole(_LOCKER_ROLE, msg.sender);
        PauseStorageWrapper._requireNotPaused();
        ERC1410StorageWrapper._requireDefaultPartitionWithSinglePartition(_partition);
        LockStorageWrapper._requireValidExpirationTimestamp(_expirationTimestamp);
        _requireUnProtectedPartitionsOrWildCardRole();
        ERC1410StorageWrapper._transferByPartition(
            msg.sender,
            BasicTransferInfo(_to, _amount),
            _partition,
            _data,
            msg.sender,
            ""
        );
        (success_, lockId_) = LockStorageWrapper._lockByPartition(
            _partition,
            _amount,
            _to,
            _expirationTimestamp,
            msg.sender
        );
        emit PartitionTransferredAndLocked(_partition, msg.sender, _to, _amount, _data, _expirationTimestamp, lockId_);
    }

    function transferAndLock(
        address _to,
        uint256 _amount,
        bytes calldata _data,
        uint256 _expirationTimestamp
    ) external override returns (bool success_, uint256 lockId_) {
        AccessControlStorageWrapper._checkRole(_LOCKER_ROLE, msg.sender);
        PauseStorageWrapper._requireNotPaused();
        ERC1410StorageWrapper._requireWithoutMultiPartition();
        LockStorageWrapper._requireValidExpirationTimestamp(_expirationTimestamp);
        _requireUnProtectedPartitionsOrWildCardRole();
        ERC1410StorageWrapper._transferByPartition(
            msg.sender,
            BasicTransferInfo(_to, _amount),
            _DEFAULT_PARTITION,
            _data,
            msg.sender,
            ""
        );
        (success_, lockId_) = LockStorageWrapper._lockByPartition(
            _DEFAULT_PARTITION,
            _amount,
            _to,
            _expirationTimestamp,
            msg.sender
        );
        emit PartitionTransferredAndLocked(
            _DEFAULT_PARTITION,
            msg.sender,
            _to,
            _amount,
            _data,
            _expirationTimestamp,
            lockId_
        );
    }

    function _requireUnProtectedPartitionsOrWildCardRole() internal view {
        if (
            ProtectedPartitionsStorageWrapper._arePartitionsProtected() &&
            !AccessControlStorageWrapper._hasRole(_WILD_CARD_ROLE, msg.sender)
        ) {
            revert IProtectedPartitionsStorageWrapper.PartitionsAreProtectedAndNoRole(msg.sender, _WILD_CARD_ROLE);
        }
    }
}
