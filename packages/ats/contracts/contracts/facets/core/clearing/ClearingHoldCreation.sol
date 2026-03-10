// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IClearingHoldCreation } from "../clearing/IClearingHoldCreation.sol";
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

abstract contract ClearingHoldCreation is IClearingHoldCreation, TimestampProvider {
    function clearingCreateHoldByPartition(
        ClearingOperation calldata _clearingOperation,
        Hold calldata _hold
    ) external override returns (bool success_, uint256 clearingId_) {
        PauseStorageWrapper.requireNotPaused();
        ComplianceStorageWrapper.requireNotRecovered(msg.sender);
        ComplianceStorageWrapper.requireNotRecovered(_hold.to);
        ERC1410StorageWrapper.requireValidAddress(_hold.escrow);
        ERC1410StorageWrapper.checkDefaultPartitionWithSinglePartition(_clearingOperation.partition);
        ClearingReadOps.checkClearingValidExpirationTimestamp(
            _clearingOperation.expirationTimestamp,
            _getBlockTimestamp()
        );
        ClearingReadOps.checkClearingValidExpirationTimestamp(_hold.expirationTimestamp, _getBlockTimestamp());
        ProtectedPartitionsStorageWrapper.checkUnProtectedPartitionsOrWildCardRole();
        if (!ClearingStorageWrapper.isClearingActivated()) revert IClearing.ClearingIsDisabled();

        (success_, clearingId_) = ClearingOps.clearingHoldCreationCreation(
            _clearingOperation,
            msg.sender,
            _hold,
            "",
            ThirdPartyType.NULL
        );
    }

    function clearingCreateHoldFromByPartition(
        ClearingOperationFrom calldata _clearingOperationFrom,
        Hold calldata _hold
    ) external override returns (bool success_, uint256 clearingId_) {
        PauseStorageWrapper.requireNotPaused();
        ComplianceStorageWrapper.requireNotRecovered(msg.sender);
        ComplianceStorageWrapper.requireNotRecovered(_hold.to);
        ComplianceStorageWrapper.requireNotRecovered(_clearingOperationFrom.from);
        ERC1410StorageWrapper.requireValidAddress(_hold.escrow);
        ERC1410StorageWrapper.requireValidAddress(_clearingOperationFrom.from);
        ERC1410StorageWrapper.checkDefaultPartitionWithSinglePartition(
            _clearingOperationFrom.clearingOperation.partition
        );
        ClearingReadOps.checkClearingValidExpirationTimestamp(
            _clearingOperationFrom.clearingOperation.expirationTimestamp,
            _getBlockTimestamp()
        );
        if (!ClearingStorageWrapper.isClearingActivated()) revert IClearing.ClearingIsDisabled();
        ClearingReadOps.checkClearingValidExpirationTimestamp(_hold.expirationTimestamp, _getBlockTimestamp());
        ProtectedPartitionsStorageWrapper.checkUnProtectedPartitionsOrWildCardRole();

        (success_, clearingId_) = ClearingOps.clearingHoldCreationCreation(
            _clearingOperationFrom.clearingOperation,
            _clearingOperationFrom.from,
            _hold,
            _clearingOperationFrom.operatorData,
            ThirdPartyType.AUTHORIZED
        );

        ClearingOps.decreaseAllowedBalanceForClearing(
            _clearingOperationFrom.clearingOperation.partition,
            clearingId_,
            ClearingOperationType.HoldCreation,
            _clearingOperationFrom.from,
            _hold.amount
        );
    }

    function operatorClearingCreateHoldByPartition(
        ClearingOperationFrom calldata _clearingOperationFrom,
        Hold calldata _hold
    ) external override returns (bool success_, uint256 clearingId_) {
        PauseStorageWrapper.requireNotPaused();
        ComplianceStorageWrapper.requireNotRecovered(msg.sender);
        ComplianceStorageWrapper.requireNotRecovered(_clearingOperationFrom.from);
        ComplianceStorageWrapper.requireNotRecovered(_hold.to);
        ERC1410StorageWrapper.requireValidAddress(_hold.escrow);
        ERC1410StorageWrapper.requireValidAddress(_clearingOperationFrom.from);
        ERC1410StorageWrapper.checkDefaultPartitionWithSinglePartition(
            _clearingOperationFrom.clearingOperation.partition
        );
        ClearingReadOps.checkClearingValidExpirationTimestamp(
            _clearingOperationFrom.clearingOperation.expirationTimestamp,
            _getBlockTimestamp()
        );
        if (!ClearingStorageWrapper.isClearingActivated()) revert IClearing.ClearingIsDisabled();
        ERC1410StorageWrapper.checkOperator(
            _clearingOperationFrom.clearingOperation.partition,
            msg.sender,
            _clearingOperationFrom.from
        );
        ClearingReadOps.checkClearingValidExpirationTimestamp(_hold.expirationTimestamp, _getBlockTimestamp());
        ProtectedPartitionsStorageWrapper.checkUnProtectedPartitionsOrWildCardRole();

        (success_, clearingId_) = ClearingOps.clearingHoldCreationCreation(
            _clearingOperationFrom.clearingOperation,
            _clearingOperationFrom.from,
            _hold,
            _clearingOperationFrom.operatorData,
            ThirdPartyType.OPERATOR
        );
    }

    function protectedClearingCreateHoldByPartition(
        ProtectedClearingOperation calldata _protectedClearingOperation,
        Hold calldata _hold,
        bytes calldata _signature
    ) external override returns (bool success_, uint256 clearingId_) {
        PauseStorageWrapper.requireNotPaused();
        ComplianceStorageWrapper.requireNotRecovered(_protectedClearingOperation.from);
        ComplianceStorageWrapper.requireNotRecovered(_hold.to);
        ProtectedPartitionsStorageWrapper.requireProtectedPartitions();
        ERC1410StorageWrapper.requireValidAddress(_protectedClearingOperation.from);
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

        (success_, clearingId_) = ClearingOps.protectedClearingCreateHoldByPartition(
            _protectedClearingOperation,
            _hold,
            _signature,
            _getBlockTimestamp()
        );
    }

    function getClearingCreateHoldForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId
    ) external view override returns (ClearingHoldCreationData memory clearingHoldCreationData_) {
        return
            ClearingReadOps.getClearingHoldCreationForByPartitionAdjustedAt(
                _partition,
                _tokenHolder,
                _clearingId,
                _getBlockTimestamp()
            );
    }
}
