// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _WILD_CARD_ROLE } from "../../../constants/roles.sol";
import { Hold, HoldIdentifier } from "./IHold.sol";
import { IHoldTokenHolder } from "./IHoldTokenHolder.sol";
import { IClearing } from "../clearing/IClearing.sol";
import {
    IProtectedPartitionsStorageWrapper
} from "../../../domain/core/protectedPartition/IProtectedPartitionsStorageWrapper.sol";
import { AccessControlStorageWrapper } from "../../../domain/core/AccessControlStorageWrapper.sol";
import { PauseStorageWrapper } from "../../../domain/core/PauseStorageWrapper.sol";
import { ProtectedPartitionsStorageWrapper } from "../../../domain/core/ProtectedPartitionsStorageWrapper.sol";
import { ERC3643StorageWrapper } from "../../../domain/core/ERC3643StorageWrapper.sol";
import { ERC1410StorageWrapper } from "../../../domain/asset/ERC1410StorageWrapper.sol";
import { ERC1594StorageWrapper } from "../../../domain/asset/ERC1594StorageWrapper.sol";
import { ClearingStorageWrapper } from "../../../domain/asset/ClearingStorageWrapper.sol";
import { LockStorageWrapper } from "../../../domain/asset/LockStorageWrapper.sol";
import { HoldStorageWrapper } from "../../../domain/asset/HoldStorageWrapper.sol";
import { ThirdPartyType } from "../../../domain/asset/types/ThirdPartyType.sol";

abstract contract HoldTokenHolder is IHoldTokenHolder {
    function createHoldByPartition(
        bytes32 _partition,
        Hold calldata _hold
    ) external override returns (bool success_, uint256 holdId_) {
        PauseStorageWrapper.requireNotPaused();
        ERC1410StorageWrapper.requireValidAddress(_hold.escrow);
        ERC3643StorageWrapper.requireUnrecoveredAddress(msg.sender);
        ERC3643StorageWrapper.requireUnrecoveredAddress(_hold.to);
        ERC1410StorageWrapper.requireDefaultPartitionWithSinglePartition(_partition);
        LockStorageWrapper.requireValidExpirationTimestamp(_hold.expirationTimestamp);
        _requireUnProtectedPartitionsOrWildCardRole();
        if (ClearingStorageWrapper.isClearingActivated()) revert IClearing.ClearingIsActivated();
        (success_, holdId_) = HoldStorageWrapper.createHoldByPartition(
            _partition,
            msg.sender,
            _hold,
            "",
            ThirdPartyType.NULL
        );

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
        ERC1410StorageWrapper.requireDefaultPartitionWithSinglePartition(_partition);
        LockStorageWrapper.requireValidExpirationTimestamp(_hold.expirationTimestamp);
        _requireUnProtectedPartitionsOrWildCardRole();
        {
            ERC3643StorageWrapper.requireUnrecoveredAddress(msg.sender);
            ERC3643StorageWrapper.requireUnrecoveredAddress(_hold.to);
            ERC3643StorageWrapper.requireUnrecoveredAddress(_from);
        }
        (success_, holdId_) = HoldStorageWrapper.createHoldByPartition(
            _partition,
            _from,
            _hold,
            _operatorData,
            ThirdPartyType.AUTHORIZED
        );

        HoldStorageWrapper.decreaseAllowedBalanceForHold(_partition, _from, _hold.amount, holdId_);

        emit HeldFromByPartition(msg.sender, _from, _partition, holdId_, _hold, _operatorData);
    }

    function executeHoldByPartition(
        HoldIdentifier calldata _holdIdentifier,
        address _to,
        uint256 _amount
    ) external override returns (bool success_, bytes32 partition_) {
        PauseStorageWrapper.requireNotPaused();
        ERC1410StorageWrapper.requireDefaultPartitionWithSinglePartition(_holdIdentifier.partition);
        ERC1594StorageWrapper.requireIdentified(_holdIdentifier.tokenHolder, _to);
        ERC1594StorageWrapper.requireCompliant(address(0), _to, false);
        HoldStorageWrapper.requireValidHoldId(_holdIdentifier);
        (success_, partition_) = HoldStorageWrapper.executeHoldByPartition(_holdIdentifier, _to, _amount);

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
        ERC1410StorageWrapper.requireDefaultPartitionWithSinglePartition(_holdIdentifier.partition);
        HoldStorageWrapper.requireValidHoldId(_holdIdentifier);
        success_ = HoldStorageWrapper.releaseHoldByPartition(_holdIdentifier, _amount);
        emit HoldByPartitionReleased(
            _holdIdentifier.tokenHolder,
            _holdIdentifier.partition,
            _holdIdentifier.holdId,
            _amount
        );
    }

    function reclaimHoldByPartition(HoldIdentifier calldata _holdIdentifier) external override returns (bool success_) {
        PauseStorageWrapper.requireNotPaused();
        ERC1410StorageWrapper.requireDefaultPartitionWithSinglePartition(_holdIdentifier.partition);
        HoldStorageWrapper.requireValidHoldId(_holdIdentifier);
        uint256 amount;
        (success_, amount) = HoldStorageWrapper.reclaimHoldByPartition(_holdIdentifier);
        emit HoldByPartitionReclaimed(
            msg.sender,
            _holdIdentifier.tokenHolder,
            _holdIdentifier.partition,
            _holdIdentifier.holdId,
            amount
        );
    }

    function _requireUnProtectedPartitionsOrWildCardRole() internal view {
        if (
            ProtectedPartitionsStorageWrapper.arePartitionsProtected() &&
            !AccessControlStorageWrapper.hasRole(_WILD_CARD_ROLE, msg.sender)
        ) {
            revert IProtectedPartitionsStorageWrapper.PartitionsAreProtectedAndNoRole(msg.sender, _WILD_CARD_ROLE);
        }
    }
}
