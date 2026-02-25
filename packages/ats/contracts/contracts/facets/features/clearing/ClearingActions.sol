// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IClearingActions } from "../interfaces/clearing/IClearingActions.sol";
import { IClearing } from "../interfaces/clearing/IClearing.sol";
import { LibPause } from "../../../lib/core/LibPause.sol";
import { LibAccess } from "../../../lib/core/LibAccess.sol";
import { LibClearing } from "../../../lib/domain/LibClearing.sol";
import { LibERC1410 } from "../../../lib/domain/LibERC1410.sol";
import { LibERC1594 } from "../../../lib/domain/LibERC1594.sol";
import { LibClearingOps } from "../../../lib/orchestrator/LibClearingOps.sol";
import { TimestampProvider } from "../../../infrastructure/lib/TimestampProvider.sol";
import { _CLEARING_VALIDATOR_ROLE, _CLEARING_ROLE } from "../../../constants/roles.sol";

abstract contract ClearingActions is IClearingActions, TimestampProvider {
    error AlreadyInitialized();

    function initializeClearing(bool _clearingActive) external override {
        if (LibClearing.isClearingInitialized()) revert AlreadyInitialized();
        LibClearing.initializeClearing(_clearingActive);
    }

    function activateClearing() external override returns (bool success_) {
        LibAccess.checkRole(_CLEARING_ROLE, msg.sender);
        LibPause.requireNotPaused();
        success_ = LibClearing.setClearing(true);
        emit ClearingActivated(msg.sender);
    }

    function deactivateClearing() external override returns (bool success_) {
        LibAccess.checkRole(_CLEARING_ROLE, msg.sender);
        LibPause.requireNotPaused();
        success_ = LibClearing.setClearing(false);
        emit ClearingDeactivated(msg.sender);
    }

    function approveClearingOperationByPartition(
        IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier
    ) external override returns (bool success_, bytes32 partition_) {
        LibAccess.checkRole(_CLEARING_VALIDATOR_ROLE, msg.sender);
        LibPause.requireNotPaused();
        LibERC1410.checkDefaultPartitionWithSinglePartition(_clearingOperationIdentifier.partition);
        if (!LibClearing.isClearingIdValid(_clearingOperationIdentifier)) {
            revert IClearing.WrongClearingId();
        }
        if (!LibClearing.isClearingActivated()) revert IClearing.ClearingIsDisabled();
        LibClearingOps.checkExpirationTimestamp(_clearingOperationIdentifier, false, _getBlockTimestamp());

        bytes memory operationData;
        (success_, operationData, partition_) = LibClearingOps.approveClearingOperationByPartition(
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
        LibAccess.checkRole(_CLEARING_VALIDATOR_ROLE, msg.sender);
        LibPause.requireNotPaused();
        LibERC1410.checkDefaultPartitionWithSinglePartition(_clearingOperationIdentifier.partition);
        if (!LibClearing.isClearingIdValid(_clearingOperationIdentifier)) {
            revert IClearing.WrongClearingId();
        }
        if (!LibClearing.isClearingActivated()) revert IClearing.ClearingIsDisabled();
        LibClearingOps.checkExpirationTimestamp(_clearingOperationIdentifier, false, _getBlockTimestamp());

        success_ = LibClearingOps.cancelClearingOperationByPartition(_clearingOperationIdentifier);

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
        LibPause.requireNotPaused();
        LibERC1410.checkDefaultPartitionWithSinglePartition(_clearingOperationIdentifier.partition);
        if (!LibClearing.isClearingIdValid(_clearingOperationIdentifier)) {
            revert IClearing.WrongClearingId();
        }
        LibERC1594.checkIdentity(_clearingOperationIdentifier.tokenHolder, address(0));
        if (!LibClearing.isClearingActivated()) revert IClearing.ClearingIsDisabled();
        LibClearingOps.checkExpirationTimestamp(_clearingOperationIdentifier, true, _getBlockTimestamp());

        success_ = LibClearingOps.reclaimClearingOperationByPartition(_clearingOperationIdentifier);

        emit ClearingOperationReclaimed(
            msg.sender,
            _clearingOperationIdentifier.tokenHolder,
            _clearingOperationIdentifier.partition,
            _clearingOperationIdentifier.clearingId,
            _clearingOperationIdentifier.clearingOperationType
        );
    }

    function isClearingActivated() external view override returns (bool) {
        return LibClearing.isClearingActivated();
    }
}
