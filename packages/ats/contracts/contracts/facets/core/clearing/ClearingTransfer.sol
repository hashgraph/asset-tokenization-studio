// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IClearingTransfer } from "../clearing/IClearingTransfer.sol";
import { IClearing } from "../clearing/IClearing.sol";
import { ThirdPartyType } from "../externalControlList/ThirdPartyType.sol";
import { PauseStorageWrapper } from "../../../domain/core/PauseStorageWrapper.sol";
import { ComplianceStorageWrapper } from "../../../domain/core/ComplianceStorageWrapper.sol";
import { ProtectedPartitionsStorageWrapper } from "../../../domain/core/ProtectedPartitionsStorageWrapper.sol";
import { AccessStorageWrapper } from "../../../domain/core/AccessStorageWrapper.sol";
import { ClearingStorageWrapper } from "../../../domain/asset/ClearingStorageWrapper.sol";
import { ERC1410StorageWrapper } from "../../../domain/asset/ERC1410StorageWrapper.sol";
import { ClearingOps } from "../../../domain/orchestrator/ClearingOps.sol";
import { ClearingReadOps } from "../../../domain/orchestrator/ClearingReadOps.sol";
import { TimestampProvider } from "../../../infrastructure/utils/TimestampProvider.sol";

abstract contract ClearingTransfer is IClearingTransfer, TimestampProvider {
    function clearingTransferByPartition(
        ClearingOperation calldata _clearingOperation,
        uint256 _amount,
        address _to
    ) external override returns (bool success_, uint256 clearingId_) {
        PauseStorageWrapper.requireNotPaused();
        ERC1410StorageWrapper.checkDefaultPartitionWithSinglePartition(_clearingOperation.partition);
        ProtectedPartitionsStorageWrapper.checkUnProtectedPartitionsOrWildCardRole();
        ClearingReadOps.checkClearingValidExpirationTimestamp(
            _clearingOperation.expirationTimestamp,
            _getBlockTimestamp()
        );
        ERC1410StorageWrapper.requireValidAddress(_to);
        ComplianceStorageWrapper.requireNotRecovered(msg.sender);
        ComplianceStorageWrapper.requireNotRecovered(_to);
        if (!ClearingStorageWrapper.isClearingActivated()) revert IClearing.ClearingIsDisabled();

        (success_, clearingId_) = ClearingOps.clearingTransferCreation(
            _clearingOperation,
            _amount,
            _to,
            msg.sender,
            "",
            ThirdPartyType.NULL
        );
    }

    function clearingTransferFromByPartition(
        ClearingOperationFrom calldata _clearingOperationFrom,
        uint256 _amount,
        address _to
    ) external override returns (bool success_, uint256 clearingId_) {
        PauseStorageWrapper.requireNotPaused();
        ERC1410StorageWrapper.checkDefaultPartitionWithSinglePartition(
            _clearingOperationFrom.clearingOperation.partition
        );
        ProtectedPartitionsStorageWrapper.checkUnProtectedPartitionsOrWildCardRole();
        ClearingReadOps.checkClearingValidExpirationTimestamp(
            _clearingOperationFrom.clearingOperation.expirationTimestamp,
            _getBlockTimestamp()
        );
        if (!ClearingStorageWrapper.isClearingActivated()) revert IClearing.ClearingIsDisabled();
        ERC1410StorageWrapper.requireValidAddress(_clearingOperationFrom.from);
        ERC1410StorageWrapper.requireValidAddress(_to);
        ComplianceStorageWrapper.requireNotRecovered(msg.sender);
        ComplianceStorageWrapper.requireNotRecovered(_to);
        ComplianceStorageWrapper.requireNotRecovered(_clearingOperationFrom.from);

        (success_, clearingId_) = ClearingOps.clearingTransferCreation(
            _clearingOperationFrom.clearingOperation,
            _amount,
            _to,
            _clearingOperationFrom.from,
            _clearingOperationFrom.operatorData,
            ThirdPartyType.AUTHORIZED
        );

        ClearingOps.decreaseAllowedBalanceForClearing(
            _clearingOperationFrom.clearingOperation.partition,
            clearingId_,
            ClearingOperationType.Transfer,
            _clearingOperationFrom.from,
            _amount
        );
    }

    function operatorClearingTransferByPartition(
        ClearingOperationFrom calldata _clearingOperationFrom,
        uint256 _amount,
        address _to
    ) external override returns (bool success_, uint256 clearingId_) {
        PauseStorageWrapper.requireNotPaused();
        ERC1410StorageWrapper.checkDefaultPartitionWithSinglePartition(
            _clearingOperationFrom.clearingOperation.partition
        );
        ProtectedPartitionsStorageWrapper.checkUnProtectedPartitionsOrWildCardRole();
        ClearingReadOps.checkClearingValidExpirationTimestamp(
            _clearingOperationFrom.clearingOperation.expirationTimestamp,
            _getBlockTimestamp()
        );
        if (!ClearingStorageWrapper.isClearingActivated()) revert IClearing.ClearingIsDisabled();
        ERC1410StorageWrapper.requireValidAddress(_clearingOperationFrom.from);
        ERC1410StorageWrapper.requireValidAddress(_to);
        ERC1410StorageWrapper.checkOperator(
            _clearingOperationFrom.clearingOperation.partition,
            msg.sender,
            _clearingOperationFrom.from
        );
        ComplianceStorageWrapper.requireNotRecovered(msg.sender);
        ComplianceStorageWrapper.requireNotRecovered(_to);
        ComplianceStorageWrapper.requireNotRecovered(_clearingOperationFrom.from);

        (success_, clearingId_) = ClearingOps.clearingTransferCreation(
            _clearingOperationFrom.clearingOperation,
            _amount,
            _to,
            _clearingOperationFrom.from,
            _clearingOperationFrom.operatorData,
            ThirdPartyType.OPERATOR
        );
    }

    function protectedClearingTransferByPartition(
        ProtectedClearingOperation calldata _protectedClearingOperation,
        uint256 _amount,
        address _to,
        bytes calldata _signature
    ) external override returns (bool success_, uint256 clearingId_) {
        PauseStorageWrapper.requireNotPaused();
        ProtectedPartitionsStorageWrapper.requireProtectedPartitions();
        ERC1410StorageWrapper.requireValidAddress(_protectedClearingOperation.from);
        ERC1410StorageWrapper.requireValidAddress(_to);
        ComplianceStorageWrapper.requireNotRecovered(_protectedClearingOperation.from);
        ComplianceStorageWrapper.requireNotRecovered(_to);
        ClearingReadOps.checkClearingValidExpirationTimestamp(
            _protectedClearingOperation.clearingOperation.expirationTimestamp,
            _getBlockTimestamp()
        );
        AccessStorageWrapper.checkRole(
            ProtectedPartitionsStorageWrapper.protectedPartitionsRole(
                _protectedClearingOperation.clearingOperation.partition
            ),
            msg.sender
        );
        if (!ClearingStorageWrapper.isClearingActivated()) revert IClearing.ClearingIsDisabled();

        (success_, clearingId_) = ClearingOps.protectedClearingTransferByPartition(
            _protectedClearingOperation,
            _amount,
            _to,
            _signature,
            _getBlockTimestamp()
        );
    }

    function getClearingTransferForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId
    ) external view override returns (ClearingTransferData memory clearingTransferData_) {
        return
            ClearingReadOps.getClearingTransferForByPartitionAdjustedAt(
                _partition,
                _tokenHolder,
                _clearingId,
                _getBlockTimestamp()
            );
    }
}
