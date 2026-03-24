// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IClearingActions } from "./IClearingActions.sol";
import { IClearing } from "./IClearing.sol";
import { IClearingStorageWrapper } from "../../../domain/asset/clearing/IClearingStorageWrapper.sol";
import { _CLEARING_VALIDATOR_ROLE, _CLEARING_ROLE } from "../../../constants/roles.sol";
import { AccessControlStorageWrapper } from "../../../domain/core/AccessControlStorageWrapper.sol";
import { AccessControlModifiers } from "../../../infrastructure/utils/AccessControlModifiers.sol";
import { PauseModifiers } from "../../../domain/core/PauseModifiers.sol";
import { ERC1410StorageWrapper } from "../../../domain/asset/ERC1410StorageWrapper.sol";
import { ERC1594StorageWrapper } from "../../../domain/asset/ERC1594StorageWrapper.sol";
import { ClearingStorageWrapper } from "../../../domain/asset/ClearingStorageWrapper.sol";
import { ClearingOps } from "../../../domain/orchestrator/ClearingOps.sol";
import { ClearingModifiers } from "../../../infrastructure/utils/ClearingModifiers.sol";

abstract contract ClearingActions is IClearingActions, AccessControlModifiers, PauseModifiers, ClearingModifiers {
    function initializeClearing(bool _clearingActive) external {
        // TODO: BAD PATTERN, _check function is required.
        if (ClearingStorageWrapper.isClearingInitialized()) revert IClearingStorageWrapper.AlreadyInitialized();
        ClearingStorageWrapper.initializeClearing(_clearingActive);
    }

    function activateClearing() external onlyUnpaused returns (bool success_) {
        success_ = ClearingStorageWrapper.setClearing(true);
        emit ClearingActivated(msg.sender);
    }

    function deactivateClearing() external onlyUnpaused returns (bool success_) {
        success_ = ClearingStorageWrapper.setClearing(false);
        emit ClearingDeactivated(msg.sender);
    }

    function approveClearingOperationByPartition(
        IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier
    )
        external
        override
        onlyUnpaused
        onlyRole(_CLEARING_VALIDATOR_ROLE)
        onlyClearingActivated
        returns (bool success_, bytes32 partition_)
    {
        ERC1410StorageWrapper.requireDefaultPartitionWithSinglePartition(_clearingOperationIdentifier.partition);
        ClearingStorageWrapper.requireValidClearingId(_clearingOperationIdentifier);
        ClearingStorageWrapper.requireClearingActivated();
        ClearingStorageWrapper.requireExpirationTimestamp(_clearingOperationIdentifier, false);
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
    ) external override onlyUnpaused onlyRole(_CLEARING_VALIDATOR_ROLE) onlyClearingActivated returns (bool success_) {
        ERC1410StorageWrapper.requireDefaultPartitionWithSinglePartition(_clearingOperationIdentifier.partition);
        ClearingStorageWrapper.requireValidClearingId(_clearingOperationIdentifier);
        ClearingStorageWrapper.requireClearingActivated();
        ClearingStorageWrapper.requireExpirationTimestamp(_clearingOperationIdentifier, false);
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
    ) external override onlyUnpaused onlyWithValidClearingId(_clearingOperationIdentifier) returns (bool success_) {
        ERC1410StorageWrapper.requireDefaultPartitionWithSinglePartition(_clearingOperationIdentifier.partition);
        ClearingStorageWrapper.requireValidClearingId(_clearingOperationIdentifier);
        ERC1594StorageWrapper.requireIdentified(_clearingOperationIdentifier.tokenHolder, address(0));
        ClearingStorageWrapper.requireClearingActivated();
        ClearingStorageWrapper.requireExpirationTimestamp(_clearingOperationIdentifier, true);
        success_ = ClearingOps.reclaimClearingOperationByPartition(_clearingOperationIdentifier);
        emit ClearingOperationReclaimed(
            msg.sender,
            _clearingOperationIdentifier.tokenHolder,
            _clearingOperationIdentifier.partition,
            _clearingOperationIdentifier.clearingId,
            _clearingOperationIdentifier.clearingOperationType
        );
    }

    function isClearingActivated() external view returns (bool) {
        return ClearingStorageWrapper.isClearingActivated();
    }
}
