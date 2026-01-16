// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    checkNounceAndDeadline,
    verify,
    getMessageHashTransferAndLockByPartition,
    getMessageHashTransferAndLock
} from "../../layer_0/common/libraries/ERC712Lib.sol";
import { ITransferAndLock } from "../../layer_3/interfaces/ITransferAndLock.sol";
import { _DEFAULT_PARTITION } from "../../layer_0/constants/values.sol";
import { BasicTransferInfo } from "../../layer_1/interfaces/ERC1400/IERC1410.sol";
import { SecurityStorageWrapper } from "../security/SecurityStorageWrapper.sol";
import {
    IProtectedPartitionsStorageWrapper
} from "../../layer_1/interfaces/protectedPartitions/IProtectedPartitionsStorageWrapper.sol";
import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";

abstract contract TransferAndLockStorageWrapper is SecurityStorageWrapper {
    function _protectedTransferAndLockByPartition(
        bytes32 _partition,
        ITransferAndLock.TransferAndLockStruct calldata _transferAndLock,
        IProtectedPartitionsStorageWrapper.ProtectionData calldata _protectionData
    ) internal override returns (bool success_, uint256 lockId_) {
        checkNounceAndDeadline(
            _protectionData.nounce,
            _transferAndLock.from,
            _getNonceFor(_transferAndLock.from),
            _protectionData.deadline,
            _blockTimestamp()
        );

        _checkTransferAndLockByPartitionSignature(_partition, _transferAndLock, _protectionData);

        _setNonceFor(_protectionData.nounce, _transferAndLock.from);

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

        emit ITransferAndLock.PartitionTransferredAndLocked(
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
    ) internal override returns (bool success_, uint256 lockId_) {
        checkNounceAndDeadline(
            _protectionData.nounce,
            _transferAndLock.from,
            _getNonceFor(_transferAndLock.from),
            _protectionData.deadline,
            _blockTimestamp()
        );

        _checkTransferAndLockSignature(_transferAndLock, _protectionData);

        _setNonceFor(_protectionData.nounce, _transferAndLock.from);

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

        emit ITransferAndLock.PartitionTransferredAndLocked(
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
    ) internal view override {
        if (!_isTransferAndLockByPartitionSignatureValid(_partition, _transferAndLock, _protectionData))
            revert WrongSignature();
    }

    function _isTransferAndLockByPartitionSignatureValid(
        bytes32 _partition,
        ITransferAndLock.TransferAndLockStruct calldata _transferAndLock,
        IProtectedPartitionsStorageWrapper.ProtectionData calldata _protectionData
    ) internal view override returns (bool) {
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
                _getName(),
                Strings.toString(_getResolverProxyVersion()),
                _blockChainid(),
                address(this)
            );
    }

    function _checkTransferAndLockSignature(
        ITransferAndLock.TransferAndLockStruct calldata _transferAndLock,
        IProtectedPartitionsStorageWrapper.ProtectionData calldata _protectionData
    ) internal view override {
        if (!_isTransferAndLockSignatureValid(_transferAndLock, _protectionData)) revert WrongSignature();
    }

    function _isTransferAndLockSignatureValid(
        ITransferAndLock.TransferAndLockStruct calldata _transferAndLock,
        IProtectedPartitionsStorageWrapper.ProtectionData calldata _protectionData
    ) internal view override returns (bool) {
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
                _getName(),
                Strings.toString(_getResolverProxyVersion()),
                _blockChainid(),
                address(this)
            );
    }
}
