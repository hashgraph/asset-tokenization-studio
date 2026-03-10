// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IHoldTokenHolder } from "../hold/IHoldTokenHolder.sol";
import { IClearing } from "../clearing/IClearing.sol";
import { ThirdPartyType } from "../externalControlList/ThirdPartyType.sol";
import { PauseStorageWrapper } from "../../../domain/core/PauseStorageWrapper.sol";
import { ComplianceStorageWrapper } from "../../../domain/core/ComplianceStorageWrapper.sol";
import { ProtectedPartitionsStorageWrapper } from "../../../domain/core/ProtectedPartitionsStorageWrapper.sol";
import { ClearingStorageWrapper } from "../../../domain/asset/ClearingStorageWrapper.sol";
import { ERC1410StorageWrapper } from "../../../domain/asset/ERC1410StorageWrapper.sol";
import { ERC1594StorageWrapper } from "../../../domain/asset/ERC1594StorageWrapper.sol";
import { HoldStorageWrapper } from "../../../domain/asset/HoldStorageWrapper.sol";
import { HoldOps } from "../../../domain/orchestrator/HoldOps.sol";
import { TimestampProvider } from "../../../infrastructure/utils/TimestampProvider.sol";

abstract contract HoldTokenHolder is IHoldTokenHolder, TimestampProvider {
    function createHoldByPartition(
        bytes32 _partition,
        Hold calldata _hold
    ) external override returns (bool success_, uint256 holdId_) {
        PauseStorageWrapper.requireNotPaused();
        ERC1410StorageWrapper.requireValidAddress(_hold.escrow);
        ComplianceStorageWrapper.requireNotRecovered(msg.sender);
        ComplianceStorageWrapper.requireNotRecovered(_hold.to);
        ERC1410StorageWrapper.checkDefaultPartitionWithSinglePartition(_partition);
        HoldOps.checkHoldValidExpirationTimestamp(_hold.expirationTimestamp, _getBlockTimestamp());
        ProtectedPartitionsStorageWrapper.checkUnProtectedPartitionsOrWildCardRole();
        if (ClearingStorageWrapper.isClearingActivated()) revert IClearing.ClearingIsActivated();

        (success_, holdId_) = HoldOps.createHoldByPartition(_partition, msg.sender, _hold, "", ThirdPartyType.NULL);

        emit HeldByPartition(msg.sender, msg.sender, _partition, holdId_, _hold, "");
    }

    function createHoldFromByPartition(
        bytes32 _partition,
        address _from,
        Hold calldata _hold,
        bytes calldata _operatorData
    ) external override returns (bool success_, uint256 holdId_) {
        PauseStorageWrapper.requireNotPaused();
        if (ClearingStorageWrapper.isClearingActivated()) revert IClearing.ClearingIsActivated();
        ERC1410StorageWrapper.requireValidAddress(_from);
        ERC1410StorageWrapper.requireValidAddress(_hold.escrow);
        ERC1410StorageWrapper.checkDefaultPartitionWithSinglePartition(_partition);
        HoldOps.checkHoldValidExpirationTimestamp(_hold.expirationTimestamp, _getBlockTimestamp());
        ProtectedPartitionsStorageWrapper.checkUnProtectedPartitionsOrWildCardRole();
        ComplianceStorageWrapper.requireNotRecovered(msg.sender);
        ComplianceStorageWrapper.requireNotRecovered(_hold.to);
        ComplianceStorageWrapper.requireNotRecovered(_from);

        (success_, holdId_) = HoldOps.createHoldByPartition(
            _partition,
            _from,
            _hold,
            _operatorData,
            ThirdPartyType.AUTHORIZED
        );

        HoldOps.decreaseAllowedBalanceForHold(_partition, _from, _hold.amount, holdId_);

        emit HeldFromByPartition(msg.sender, _from, _partition, holdId_, _hold, _operatorData);
    }

    function executeHoldByPartition(
        HoldIdentifier calldata _holdIdentifier,
        address _to,
        uint256 _amount
    ) external override returns (bool success_, bytes32 partition_) {
        PauseStorageWrapper.requireNotPaused();
        ERC1410StorageWrapper.checkDefaultPartitionWithSinglePartition(_holdIdentifier.partition);
        ERC1594StorageWrapper.checkIdentity(_holdIdentifier.tokenHolder, _to);
        ERC1594StorageWrapper.checkCompliance(msg.sender, address(0), _to, false);
        HoldStorageWrapper.validateHoldId(_holdIdentifier);

        (success_, partition_) = HoldOps.executeHoldByPartition(_holdIdentifier, _to, _amount, _getBlockTimestamp());

        emit HoldByPartitionExecuted(
            _holdIdentifier.tokenHolder,
            _holdIdentifier.partition,
            _holdIdentifier.holdId,
            _amount,
            _to
        );
    }

    function releaseHoldByPartition(
        HoldIdentifier calldata _holdIdentifier,
        uint256 _amount
    ) external override returns (bool success_) {
        PauseStorageWrapper.requireNotPaused();
        ERC1410StorageWrapper.checkDefaultPartitionWithSinglePartition(_holdIdentifier.partition);
        HoldStorageWrapper.validateHoldId(_holdIdentifier);

        success_ = HoldOps.releaseHoldByPartition(_holdIdentifier, _amount, _getBlockTimestamp());

        emit HoldByPartitionReleased(
            _holdIdentifier.tokenHolder,
            _holdIdentifier.partition,
            _holdIdentifier.holdId,
            _amount
        );
    }

    function reclaimHoldByPartition(HoldIdentifier calldata _holdIdentifier) external override returns (bool success_) {
        PauseStorageWrapper.requireNotPaused();
        ERC1410StorageWrapper.checkDefaultPartitionWithSinglePartition(_holdIdentifier.partition);
        HoldStorageWrapper.validateHoldId(_holdIdentifier);

        uint256 amount;
        (success_, amount) = HoldOps.reclaimHoldByPartition(_holdIdentifier, _getBlockTimestamp());

        emit HoldByPartitionReclaimed(
            msg.sender,
            _holdIdentifier.tokenHolder,
            _holdIdentifier.partition,
            _holdIdentifier.holdId,
            amount
        );
    }
}
