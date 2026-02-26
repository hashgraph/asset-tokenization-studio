// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IHoldTokenHolder } from "../interfaces/hold/IHoldTokenHolder.sol";
import { IClearing } from "../interfaces/clearing/IClearing.sol";
import { Hold, HoldIdentifier } from "../interfaces/hold/IHold.sol";
import { ThirdPartyType } from "../types/ThirdPartyType.sol";
import { LibPause } from "../../../lib/core/LibPause.sol";
import { LibCompliance } from "../../../lib/core/LibCompliance.sol";
import { LibProtectedPartitions } from "../../../lib/core/LibProtectedPartitions.sol";
import { LibClearing } from "../../../lib/domain/LibClearing.sol";
import { LibERC1410 } from "../../../lib/domain/LibERC1410.sol";
import { LibERC1594 } from "../../../lib/domain/LibERC1594.sol";
import { LibHold } from "../../../lib/domain/LibHold.sol";
import { HoldOps } from "../../../lib/orchestrator/HoldOps.sol";
import { TimestampProvider } from "../../../infrastructure/lib/TimestampProvider.sol";

abstract contract HoldTokenHolder is IHoldTokenHolder, TimestampProvider {
    function createHoldByPartition(
        bytes32 _partition,
        Hold calldata _hold
    ) external override returns (bool success_, uint256 holdId_) {
        LibPause.requireNotPaused();
        LibERC1410.requireValidAddress(_hold.escrow);
        LibCompliance.requireNotRecovered(msg.sender);
        LibCompliance.requireNotRecovered(_hold.to);
        LibERC1410.checkDefaultPartitionWithSinglePartition(_partition);
        HoldOps.checkHoldValidExpirationTimestamp(_hold.expirationTimestamp, _getBlockTimestamp());
        LibProtectedPartitions.checkUnProtectedPartitionsOrWildCardRole();
        if (LibClearing.isClearingActivated()) revert IClearing.ClearingIsActivated();

        (success_, holdId_) = HoldOps.createHoldByPartition(_partition, msg.sender, _hold, "", ThirdPartyType.NULL);

        emit HeldByPartition(msg.sender, msg.sender, _partition, holdId_, _hold, "");
    }

    function createHoldFromByPartition(
        bytes32 _partition,
        address _from,
        Hold calldata _hold,
        bytes calldata _operatorData
    ) external override returns (bool success_, uint256 holdId_) {
        LibPause.requireNotPaused();
        if (LibClearing.isClearingActivated()) revert IClearing.ClearingIsActivated();
        LibERC1410.requireValidAddress(_from);
        LibERC1410.requireValidAddress(_hold.escrow);
        LibERC1410.checkDefaultPartitionWithSinglePartition(_partition);
        HoldOps.checkHoldValidExpirationTimestamp(_hold.expirationTimestamp, _getBlockTimestamp());
        LibProtectedPartitions.checkUnProtectedPartitionsOrWildCardRole();
        LibCompliance.requireNotRecovered(msg.sender);
        LibCompliance.requireNotRecovered(_hold.to);
        LibCompliance.requireNotRecovered(_from);

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
        LibPause.requireNotPaused();
        LibERC1410.checkDefaultPartitionWithSinglePartition(_holdIdentifier.partition);
        LibERC1594.checkIdentity(_holdIdentifier.tokenHolder, _to);
        LibERC1594.checkCompliance(msg.sender, address(0), _to, false);
        LibHold.validateHoldId(_holdIdentifier);

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
        LibPause.requireNotPaused();
        LibERC1410.checkDefaultPartitionWithSinglePartition(_holdIdentifier.partition);
        LibHold.validateHoldId(_holdIdentifier);

        success_ = HoldOps.releaseHoldByPartition(_holdIdentifier, _amount, _getBlockTimestamp());

        emit HoldByPartitionReleased(
            _holdIdentifier.tokenHolder,
            _holdIdentifier.partition,
            _holdIdentifier.holdId,
            _amount
        );
    }

    function reclaimHoldByPartition(HoldIdentifier calldata _holdIdentifier) external override returns (bool success_) {
        LibPause.requireNotPaused();
        LibERC1410.checkDefaultPartitionWithSinglePartition(_holdIdentifier.partition);
        LibHold.validateHoldId(_holdIdentifier);

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
