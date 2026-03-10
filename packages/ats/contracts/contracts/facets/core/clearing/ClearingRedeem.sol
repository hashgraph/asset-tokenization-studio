// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IClearingRedeem } from "../clearing/IClearingRedeem.sol";
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

abstract contract ClearingRedeem is IClearingRedeem, TimestampProvider {
    function clearingRedeemByPartition(
        ClearingOperation calldata _clearingOperation,
        uint256 _amount
    ) external override returns (bool success_, uint256 clearingId_) {
        PauseStorageWrapper.requireNotPaused();
        ComplianceStorageWrapper.requireNotRecovered(msg.sender);
        ERC1410StorageWrapper.checkDefaultPartitionWithSinglePartition(_clearingOperation.partition);
        ProtectedPartitionsStorageWrapper.checkUnProtectedPartitionsOrWildCardRole();
        ClearingReadOps.checkClearingValidExpirationTimestamp(
            _clearingOperation.expirationTimestamp,
            _getBlockTimestamp()
        );
        if (!ClearingStorageWrapper.isClearingActivated()) revert IClearing.ClearingIsDisabled();

        (success_, clearingId_) = ClearingOps.clearingRedeemCreation(
            _clearingOperation,
            _amount,
            msg.sender,
            "",
            ThirdPartyType.NULL
        );
    }

    function clearingRedeemFromByPartition(
        ClearingOperationFrom calldata _clearingOperationFrom,
        uint256 _amount
    ) external override returns (bool success_, uint256 clearingId_) {
        PauseStorageWrapper.requireNotPaused();
        ComplianceStorageWrapper.requireNotRecovered(_clearingOperationFrom.from);
        ERC1410StorageWrapper.checkDefaultPartitionWithSinglePartition(
            _clearingOperationFrom.clearingOperation.partition
        );
        ProtectedPartitionsStorageWrapper.checkUnProtectedPartitionsOrWildCardRole();
        ClearingReadOps.checkClearingValidExpirationTimestamp(
            _clearingOperationFrom.clearingOperation.expirationTimestamp,
            _getBlockTimestamp()
        );
        ComplianceStorageWrapper.requireNotRecovered(msg.sender);
        ERC1410StorageWrapper.requireValidAddress(_clearingOperationFrom.from);
        if (!ClearingStorageWrapper.isClearingActivated()) revert IClearing.ClearingIsDisabled();

        (success_, clearingId_) = ClearingOps.clearingRedeemCreation(
            _clearingOperationFrom.clearingOperation,
            _amount,
            _clearingOperationFrom.from,
            _clearingOperationFrom.operatorData,
            ThirdPartyType.AUTHORIZED
        );

        ClearingOps.decreaseAllowedBalanceForClearing(
            _clearingOperationFrom.clearingOperation.partition,
            clearingId_,
            ClearingOperationType.Redeem,
            _clearingOperationFrom.from,
            _amount
        );
    }

    function operatorClearingRedeemByPartition(
        ClearingOperationFrom calldata _clearingOperationFrom,
        uint256 _amount
    ) external override returns (bool success_, uint256 clearingId_) {
        PauseStorageWrapper.requireNotPaused();
        ComplianceStorageWrapper.requireNotRecovered(_clearingOperationFrom.from);
        ERC1410StorageWrapper.checkDefaultPartitionWithSinglePartition(
            _clearingOperationFrom.clearingOperation.partition
        );
        ProtectedPartitionsStorageWrapper.checkUnProtectedPartitionsOrWildCardRole();
        ClearingReadOps.checkClearingValidExpirationTimestamp(
            _clearingOperationFrom.clearingOperation.expirationTimestamp,
            _getBlockTimestamp()
        );
        ERC1410StorageWrapper.requireValidAddress(_clearingOperationFrom.from);
        ComplianceStorageWrapper.requireNotRecovered(msg.sender);
        if (!ClearingStorageWrapper.isClearingActivated()) revert IClearing.ClearingIsDisabled();
        ERC1410StorageWrapper.checkOperator(
            _clearingOperationFrom.clearingOperation.partition,
            msg.sender,
            _clearingOperationFrom.from
        );

        (success_, clearingId_) = ClearingOps.clearingRedeemCreation(
            _clearingOperationFrom.clearingOperation,
            _amount,
            _clearingOperationFrom.from,
            _clearingOperationFrom.operatorData,
            ThirdPartyType.OPERATOR
        );
    }

    function protectedClearingRedeemByPartition(
        ProtectedClearingOperation calldata _protectedClearingOperation,
        uint256 _amount,
        bytes calldata _signature
    ) external override returns (bool success_, uint256 clearingId_) {
        PauseStorageWrapper.requireNotPaused();
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
        ComplianceStorageWrapper.requireNotRecovered(_protectedClearingOperation.from);

        (success_, clearingId_) = ClearingOps.protectedClearingRedeemByPartition(
            _protectedClearingOperation,
            _amount,
            _signature,
            _getBlockTimestamp()
        );
    }

    function getClearingRedeemForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId
    ) external view override returns (ClearingRedeemData memory clearingRedeemData_) {
        return
            ClearingReadOps.getClearingRedeemForByPartitionAdjustedAt(
                _partition,
                _tokenHolder,
                _clearingId,
                _getBlockTimestamp()
            );
    }
}
