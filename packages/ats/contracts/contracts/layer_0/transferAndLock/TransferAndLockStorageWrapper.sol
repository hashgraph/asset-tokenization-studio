// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { checkNounceAndDeadline, verify } from "../../layer_1/protectedPartitions/signatureVerification.sol";
import { ITransferAndLock } from "../../layer_3/interfaces/ITransferAndLock.sol";
import { ITransferAndLockStorageWrapper } from "../../layer_3/interfaces/ITransferAndLockStorageWrapper.sol";
import { _DEFAULT_PARTITION } from "../../layer_0/constants/values.sol";
import {
    getMessageHashTransferAndLockByPartition,
    getMessageHashTransferAndLock
} from "../../layer_3/transferAndLock/signatureVerification.sol";
import { BasicTransferInfo } from "../../layer_1/interfaces/ERC1400/IERC1410.sol";
import { SecurityStorageWrapper } from "../security/SecurityStorageWrapper.sol";
import {
    IProtectedPartitionsStorageWrapper
} from "../../layer_1/interfaces/protectedPartitions/IProtectedPartitionsStorageWrapper.sol";

abstract contract TransferAndLockStorageWrapper is ITransferAndLockStorageWrapper, SecurityStorageWrapper {
    function _protectedTransferAndLockByPartition(
        bytes32 _partition,
        ITransferAndLock.TransferAndLockStruct calldata _transferAndLock,
        IProtectedPartitionsStorageWrapper.ProtectionData calldata _protectionData
    ) internal returns (bool success_, uint256 lockId_) {
        checkNounceAndDeadline(
            _protectionData.nounce,
            _transferAndLock.from,
            _getNounceFor(_transferAndLock.from),
            _protectionData.deadline,
            _blockTimestamp()
        );

        _checkTransferAndLockByPartitionSignature(_partition, _transferAndLock, _protectionData);

        _setNounce(_protectionData.nounce, _transferAndLock.from);

        _transferByPartition(
            _msgSender(),
            BasicTransferInfo(_transferAndLock.to, _transferAndLock.amount),
            _partition,
            _transferAndLock.data,
            _msgSender(),
            ""
        );
        (success_, lockId_) = _lockByPartition(
            _partition,
            _transferAndLock.amount,
            _transferAndLock.to,
            _transferAndLock.expirationTimestamp
        );

        emit PartitionTransferredAndLocked(
            _partition,
            _msgSender(),
            _transferAndLock.to,
            _transferAndLock.amount,
            _transferAndLock.data,
            _transferAndLock.expirationTimestamp,
            lockId_
        );
    }

    function _protectedTransferAndLock(
        ITransferAndLock.TransferAndLockStruct calldata _transferAndLock,
        IProtectedPartitionsStorageWrapper.ProtectionData calldata _protectionData
    ) internal returns (bool success_, uint256 lockId_) {
        checkNounceAndDeadline(
            _protectionData.nounce,
            _transferAndLock.from,
            _getNounceFor(_transferAndLock.from),
            _protectionData.deadline,
            _blockTimestamp()
        );

        _checkTransferAndLockSignature(_transferAndLock, _protectionData);

        _setNounce(_protectionData.nounce, _transferAndLock.from);

        _transferByPartition(
            _msgSender(),
            BasicTransferInfo(_transferAndLock.to, _transferAndLock.amount),
            _DEFAULT_PARTITION,
            _transferAndLock.data,
            _msgSender(),
            ""
        );
        (success_, lockId_) = _lockByPartition(
            _DEFAULT_PARTITION,
            _transferAndLock.amount,
            _transferAndLock.to,
            _transferAndLock.expirationTimestamp
        );

        emit PartitionTransferredAndLocked(
            _DEFAULT_PARTITION,
            _msgSender(),
            _transferAndLock.to,
            _transferAndLock.amount,
            _transferAndLock.data,
            _transferAndLock.expirationTimestamp,
            lockId_
        );
    }

    function _checkTransferAndLockByPartitionSignature(
        bytes32 _partition,
        ITransferAndLock.TransferAndLockStruct calldata _transferAndLock,
        IProtectedPartitionsStorageWrapper.ProtectionData calldata _protectionData
    ) internal view {
        if (!_isTransferAndLockByPartitionSignatureValid(_partition, _transferAndLock, _protectionData))
            revert WrongSignature();
    }

    function _isTransferAndLockByPartitionSignatureValid(
        bytes32 _partition,
        ITransferAndLock.TransferAndLockStruct calldata _transferAndLock,
        IProtectedPartitionsStorageWrapper.ProtectionData calldata _protectionData
    ) internal view returns (bool) {
        bytes32 functionHash = getMessageHashTransferAndLockByPartition(
            _partition,
            _transferAndLock.from,
            _transferAndLock.to,
            _transferAndLock.amount,
            _transferAndLock.data,
            _transferAndLock.expirationTimestamp,
            _protectionData.deadline,
            _protectionData.nounce
        );
        return
            verify(
                _transferAndLock.from,
                functionHash,
                _protectionData.signature,
                _protectedPartitionsStorage().contractName,
                _protectedPartitionsStorage().contractVersion,
                _blockChainid(),
                address(this)
            );
    }

    function _checkTransferAndLockSignature(
        ITransferAndLock.TransferAndLockStruct calldata _transferAndLock,
        IProtectedPartitionsStorageWrapper.ProtectionData calldata _protectionData
    ) internal view {
        if (!_isTransferAndLockSignatureValid(_transferAndLock, _protectionData)) revert WrongSignature();
    }

    function _isTransferAndLockSignatureValid(
        ITransferAndLock.TransferAndLockStruct calldata _transferAndLock,
        IProtectedPartitionsStorageWrapper.ProtectionData calldata _protectionData
    ) internal view returns (bool) {
        bytes32 functionHash = getMessageHashTransferAndLock(
            _transferAndLock.from,
            _transferAndLock.to,
            _transferAndLock.amount,
            _transferAndLock.data,
            _transferAndLock.expirationTimestamp,
            _protectionData.deadline,
            _protectionData.nounce
        );
        return
            verify(
                _transferAndLock.from,
                functionHash,
                _protectionData.signature,
                _protectedPartitionsStorage().contractName,
                _protectedPartitionsStorage().contractVersion,
                _blockChainid(),
                address(this)
            );
    }
}
