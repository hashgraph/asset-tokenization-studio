// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IClearingActions } from "./IClearingActions.sol";
import { IClearing } from "./IClearing.sol";
import { _CLEARING_VALIDATOR_ROLE, _CLEARING_ROLE } from "../../../constants/roles.sol";
import { AccessControlStorageWrapper } from "../../../domain/core/AccessControlStorageWrapper.sol";
import { PauseStorageWrapper } from "../../../domain/core/PauseStorageWrapper.sol";
import { ERC1410StorageWrapper } from "../../../domain/asset/ERC1410StorageWrapper.sol";
import { ERC1594StorageWrapper } from "../../../domain/asset/ERC1594StorageWrapper.sol";
import { ClearingStorageWrapper } from "../../../domain/asset/ClearingStorageWrapper.sol";

abstract contract ClearingActions is IClearingActions {
    error AlreadyInitialized();

    function initializeClearing(bool _clearingActive) external {
        if (ClearingStorageWrapper._isClearingInitialized()) revert AlreadyInitialized();
        ClearingStorageWrapper._initializeClearing(_clearingActive);
    }

    function activateClearing() external returns (bool success_) {
        AccessControlStorageWrapper._checkRole(_CLEARING_ROLE, msg.sender);
        PauseStorageWrapper._requireNotPaused();
        success_ = ClearingStorageWrapper._setClearing(true);
        emit ClearingActivated(msg.sender);
    }

    function deactivateClearing() external returns (bool success_) {
        AccessControlStorageWrapper._checkRole(_CLEARING_ROLE, msg.sender);
        PauseStorageWrapper._requireNotPaused();
        success_ = ClearingStorageWrapper._setClearing(false);
        emit ClearingDeactivated(msg.sender);
    }

    function approveClearingOperationByPartition(
        IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier
    ) external override returns (bool success_, bytes32 partition_) {
        AccessControlStorageWrapper._checkRole(_CLEARING_VALIDATOR_ROLE, msg.sender);
        PauseStorageWrapper._requireNotPaused();
        ERC1410StorageWrapper._requireDefaultPartitionWithSinglePartition(_clearingOperationIdentifier.partition);
        ClearingStorageWrapper._requireValidClearingId(_clearingOperationIdentifier);
        ClearingStorageWrapper._requireClearingActivated();
        ClearingStorageWrapper._requireExpirationTimestamp(_clearingOperationIdentifier, false);
        bytes memory operationData;
        (success_, operationData, partition_) = ClearingStorageWrapper._approveClearingOperationByPartition(
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
        AccessControlStorageWrapper._checkRole(_CLEARING_VALIDATOR_ROLE, msg.sender);
        PauseStorageWrapper._requireNotPaused();
        ERC1410StorageWrapper._requireDefaultPartitionWithSinglePartition(_clearingOperationIdentifier.partition);
        ClearingStorageWrapper._requireValidClearingId(_clearingOperationIdentifier);
        ClearingStorageWrapper._requireClearingActivated();
        ClearingStorageWrapper._requireExpirationTimestamp(_clearingOperationIdentifier, false);
        success_ = ClearingStorageWrapper._cancelClearingOperationByPartition(_clearingOperationIdentifier);
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
        PauseStorageWrapper._requireNotPaused();
        ERC1410StorageWrapper._requireDefaultPartitionWithSinglePartition(_clearingOperationIdentifier.partition);
        ClearingStorageWrapper._requireValidClearingId(_clearingOperationIdentifier);
        ERC1594StorageWrapper._requireIdentified(_clearingOperationIdentifier.tokenHolder, address(0));
        ClearingStorageWrapper._requireClearingActivated();
        ClearingStorageWrapper._requireExpirationTimestamp(_clearingOperationIdentifier, true);
        success_ = ClearingStorageWrapper._reclaimClearingOperationByPartition(_clearingOperationIdentifier);
        emit ClearingOperationReclaimed(
            msg.sender,
            _clearingOperationIdentifier.tokenHolder,
            _clearingOperationIdentifier.partition,
            _clearingOperationIdentifier.clearingId,
            _clearingOperationIdentifier.clearingOperationType
        );
    }

    function isClearingActivated() external view returns (bool) {
        return ClearingStorageWrapper._isClearingActivated();
    }
}
