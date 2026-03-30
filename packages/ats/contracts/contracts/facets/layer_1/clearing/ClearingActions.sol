// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IClearingActions } from "./IClearingActions.sol";
import { IClearing } from "./IClearing.sol";
import { _CLEARING_VALIDATOR_ROLE, _CLEARING_ROLE } from "../../../constants/roles.sol";
import { Modifiers } from "../../../services/Modifiers.sol";
import { ERC1410StorageWrapper } from "../../../domain/asset/ERC1410StorageWrapper.sol";
import { ERC1594StorageWrapper } from "../../../domain/asset/ERC1594StorageWrapper.sol";
import { ClearingStorageWrapper } from "../../../domain/asset/ClearingStorageWrapper.sol";
import { ClearingOps } from "../../../domain/orchestrator/ClearingOps.sol";
import { _checkNotInitialized } from "../../../services/InitializationErrors.sol";
import { EvmAccessors } from "../../../infrastructure/utils/EvmAccessors.sol";

abstract contract ClearingActions is IClearingActions, Modifiers {
    function initializeClearing(bool _clearingActive) external {
        _checkNotInitialized(ClearingStorageWrapper.isClearingInitialized());
        ClearingStorageWrapper.initializeClearing(_clearingActive);
    }

    function activateClearing() external onlyUnpaused onlyRole(_CLEARING_ROLE) returns (bool success_) {
        success_ = ClearingStorageWrapper.setClearing(true);
        emit ClearingActivated(EvmAccessors.getMsgSender());
    }

    function deactivateClearing() external onlyUnpaused onlyRole(_CLEARING_ROLE) returns (bool success_) {
        success_ = ClearingStorageWrapper.setClearing(false);
        emit ClearingDeactivated(EvmAccessors.getMsgSender());
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
        ClearingStorageWrapper.requireExpirationTimestamp(_clearingOperationIdentifier, false);

        // Check identity verification for tokenHolder
        ERC1594StorageWrapper.requireIdentified(_clearingOperationIdentifier.tokenHolder, address(0));

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
    )
        external
        override
        onlyUnpaused
        onlyDefaultPartitionWithSinglePartition(_clearingOperationIdentifier.partition)
        onlyWithValidClearingId(_clearingOperationIdentifier)
        returns (bool success_)
    {
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
