// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IClearingActions } from "./IClearingActions.sol";
import { IClearingTypes } from "./IClearingTypes.sol";
import { _CLEARING_VALIDATOR_ROLE, _CLEARING_ROLE } from "../../../constants/roles.sol";
import { Modifiers } from "../../../services/Modifiers.sol";
import { ERC1594StorageWrapper } from "../../../domain/asset/ERC1594StorageWrapper.sol";
import { ClearingStorageWrapper } from "../../../domain/asset/ClearingStorageWrapper.sol";
import { ClearingOps } from "../../../domain/orchestrator/ClearingOps.sol";
import { EvmAccessors } from "../../../infrastructure/utils/EvmAccessors.sol";

abstract contract ClearingActions is IClearingActions, Modifiers {
    function initializeClearing(bool _clearingActive) external onlyNotClearingInitialized {
        ClearingStorageWrapper.initializeClearing(_clearingActive);
    }

    function activateClearing() external onlyUnpaused onlyRole(_CLEARING_ROLE) returns (bool success_) {
        emit ClearingActivated(EvmAccessors.getMsgSender());
        success_ = ClearingStorageWrapper.setClearing(true);
    }

    function deactivateClearing() external onlyUnpaused onlyRole(_CLEARING_ROLE) returns (bool success_) {
        emit ClearingDeactivated(EvmAccessors.getMsgSender());
        success_ = ClearingStorageWrapper.setClearing(false);
    }

    function approveClearingOperationByPartition(
        IClearingTypes.ClearingOperationIdentifier calldata _clearingOperationIdentifier
    )
        external
        override
        onlyUnpaused
        onlyRole(_CLEARING_VALIDATOR_ROLE)
        onlyClearingActivated
        onlyDefaultPartitionWithSinglePartition(_clearingOperationIdentifier.partition)
        onlyWithValidClearingId(_clearingOperationIdentifier)
        onlyValidExpirationTimestampForClearing(_clearingOperationIdentifier, false)
        onlyIdentifiedAddresses(_clearingOperationIdentifier.tokenHolder, address(0))
        returns (bool success_, bytes32 partition_)
    {
        bytes memory operationData;
        (success_, operationData, partition_) = ClearingOps.approveClearingOperationByPartition(
            _clearingOperationIdentifier
        );

        emit ClearingOperationApproved(
            EvmAccessors.getMsgSender(),
            _clearingOperationIdentifier.tokenHolder,
            _clearingOperationIdentifier.partition,
            _clearingOperationIdentifier.clearingId,
            _clearingOperationIdentifier.clearingOperationType,
            operationData
        );
    }

    function cancelClearingOperationByPartition(
        IClearingTypes.ClearingOperationIdentifier calldata _clearingOperationIdentifier
    )
        external
        override
        onlyUnpaused
        onlyRole(_CLEARING_VALIDATOR_ROLE)
        onlyClearingActivated
        onlyDefaultPartitionWithSinglePartition(_clearingOperationIdentifier.partition)
        onlyWithValidClearingId(_clearingOperationIdentifier)
        onlyValidExpirationTimestampForClearing(_clearingOperationIdentifier, false)
        returns (bool success_)
    {
        success_ = ClearingOps.cancelClearingOperationByPartition(_clearingOperationIdentifier);
        emit ClearingOperationCanceled(
            EvmAccessors.getMsgSender(),
            _clearingOperationIdentifier.tokenHolder,
            _clearingOperationIdentifier.partition,
            _clearingOperationIdentifier.clearingId,
            _clearingOperationIdentifier.clearingOperationType
        );
    }

    function reclaimClearingOperationByPartition(
        IClearingTypes.ClearingOperationIdentifier calldata _clearingOperationIdentifier
    )
        external
        override
        onlyUnpaused
        onlyDefaultPartitionWithSinglePartition(_clearingOperationIdentifier.partition)
        onlyWithValidClearingId(_clearingOperationIdentifier)
        onlyClearingActivated
        onlyValidExpirationTimestampForClearing(_clearingOperationIdentifier, true)
        onlyIdentifiedAddresses(_clearingOperationIdentifier.tokenHolder, address(0))
        returns (bool success_)
    {
        success_ = ClearingOps.reclaimClearingOperationByPartition(_clearingOperationIdentifier);
        emit ClearingOperationReclaimed(
            EvmAccessors.getMsgSender(),
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
