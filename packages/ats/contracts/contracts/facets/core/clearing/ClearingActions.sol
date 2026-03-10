// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IClearingActions } from "../clearing/IClearingActions.sol";
import { IClearing } from "../clearing/IClearing.sol";
import { PauseStorageWrapper } from "../../../domain/core/PauseStorageWrapper.sol";
import { AccessStorageWrapper } from "../../../domain/core/AccessStorageWrapper.sol";
import { ClearingStorageWrapper } from "../../../domain/asset/ClearingStorageWrapper.sol";
import { ERC1410StorageWrapper } from "../../../domain/asset/ERC1410StorageWrapper.sol";
import { ERC1594StorageWrapper } from "../../../domain/asset/ERC1594StorageWrapper.sol";
import { ClearingOps } from "../../../domain/orchestrator/ClearingOps.sol";
import { ClearingReadOps } from "../../../domain/orchestrator/ClearingReadOps.sol";
import { TimestampProvider } from "../../../infrastructure/utils/TimestampProvider.sol";
import { _CLEARING_VALIDATOR_ROLE, _CLEARING_ROLE } from "../../../constants/roles.sol";

abstract contract ClearingActions is IClearingActions, TimestampProvider {
    error AlreadyInitialized();

    function initializeClearing(bool _clearingActive) external override {
        if (ClearingStorageWrapper.isClearingInitialized()) revert AlreadyInitialized();
        ClearingStorageWrapper.initializeClearing(_clearingActive);
    }

    function activateClearing() external override returns (bool success_) {
        AccessStorageWrapper.checkRole(_CLEARING_ROLE, msg.sender);
        PauseStorageWrapper.requireNotPaused();
        success_ = ClearingStorageWrapper.setClearing(true);
        emit ClearingActivated(msg.sender);
    }

    function deactivateClearing() external override returns (bool success_) {
        AccessStorageWrapper.checkRole(_CLEARING_ROLE, msg.sender);
        PauseStorageWrapper.requireNotPaused();
        success_ = ClearingStorageWrapper.setClearing(false);
        emit ClearingDeactivated(msg.sender);
    }

    function approveClearingOperationByPartition(
        IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier
    ) external override returns (bool success_, bytes32 partition_) {
        AccessStorageWrapper.checkRole(_CLEARING_VALIDATOR_ROLE, msg.sender);
        PauseStorageWrapper.requireNotPaused();
        ERC1410StorageWrapper.checkDefaultPartitionWithSinglePartition(_clearingOperationIdentifier.partition);
        if (!ClearingStorageWrapper.isClearingIdValid(_clearingOperationIdentifier)) {
            revert IClearing.WrongClearingId();
        }
        if (!ClearingStorageWrapper.isClearingActivated()) revert IClearing.ClearingIsDisabled();
        ClearingReadOps.checkClearingExpirationTimestamp(_clearingOperationIdentifier, false, _getBlockTimestamp());

        bytes memory operationData;
        (success_, operationData, partition_) = ClearingOps.approveClearingOperationByPartition(
            _clearingOperationIdentifier
        );

        emit ClearingOperationApproved(
            msg.sender,
            _clearingOperationIdentifier.tokenHolder,
            _clearingOperationIdentifier.partition,
            _clearingOperationIdentifier.clearingId,
            _clearingOperationIdentifier.clearingOperationType,
            operationData
        );
    }

    function cancelClearingOperationByPartition(
        IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier
    ) external override returns (bool success_) {
        AccessStorageWrapper.checkRole(_CLEARING_VALIDATOR_ROLE, msg.sender);
        PauseStorageWrapper.requireNotPaused();
        ERC1410StorageWrapper.checkDefaultPartitionWithSinglePartition(_clearingOperationIdentifier.partition);
        if (!ClearingStorageWrapper.isClearingIdValid(_clearingOperationIdentifier)) {
            revert IClearing.WrongClearingId();
        }
        if (!ClearingStorageWrapper.isClearingActivated()) revert IClearing.ClearingIsDisabled();
        ClearingReadOps.checkClearingExpirationTimestamp(_clearingOperationIdentifier, false, _getBlockTimestamp());

        success_ = ClearingOps.cancelClearingOperationByPartition(_clearingOperationIdentifier);

        emit ClearingOperationCanceled(
            msg.sender,
            _clearingOperationIdentifier.tokenHolder,
            _clearingOperationIdentifier.partition,
            _clearingOperationIdentifier.clearingId,
            _clearingOperationIdentifier.clearingOperationType
        );
    }

    function reclaimClearingOperationByPartition(
        IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier
    ) external override returns (bool success_) {
        PauseStorageWrapper.requireNotPaused();
        ERC1410StorageWrapper.checkDefaultPartitionWithSinglePartition(_clearingOperationIdentifier.partition);
        if (!ClearingStorageWrapper.isClearingIdValid(_clearingOperationIdentifier)) {
            revert IClearing.WrongClearingId();
        }
        ERC1594StorageWrapper.checkIdentity(_clearingOperationIdentifier.tokenHolder, address(0));
        if (!ClearingStorageWrapper.isClearingActivated()) revert IClearing.ClearingIsDisabled();
        ClearingReadOps.checkClearingExpirationTimestamp(_clearingOperationIdentifier, true, _getBlockTimestamp());

        success_ = ClearingOps.reclaimClearingOperationByPartition(_clearingOperationIdentifier);

        emit ClearingOperationReclaimed(
            msg.sender,
            _clearingOperationIdentifier.tokenHolder,
            _clearingOperationIdentifier.partition,
            _clearingOperationIdentifier.clearingId,
            _clearingOperationIdentifier.clearingOperationType
        );
    }

    function isClearingActivated() external view override returns (bool) {
        return ClearingStorageWrapper.isClearingActivated();
    }
}
