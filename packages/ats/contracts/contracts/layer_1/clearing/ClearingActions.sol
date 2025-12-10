// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { Common } from "../../layer_0/common/Common.sol";
import { IClearingActions } from "../interfaces/clearing/IClearingActions.sol";
import { IClearing } from "../interfaces/clearing/IClearing.sol";
import { _CLEARING_VALIDATOR_ROLE } from "../constants/roles.sol";
import { _CLEARING_ROLE } from "../constants/roles.sol";

abstract contract ClearingActions is IClearingActions, Common {
    function initializeClearing(bool _clearingActive) external onlyUninitialized(_clearingStorage().initialized) {
        IClearing.ClearingDataStorage storage clearingStorage = _clearingStorage();
        clearingStorage.initialized = true;
        clearingStorage.activated = _clearingActive;
    }

    function activateClearing() external onlyRole(_CLEARING_ROLE) onlyUnpaused returns (bool success_) {
        success_ = _setClearing(true);
        emit ClearingActivated(_msgSender());
    }

    function deactivateClearing() external onlyRole(_CLEARING_ROLE) onlyUnpaused returns (bool success_) {
        success_ = _setClearing(false);
        emit ClearingDeactivated(_msgSender());
    }

    function approveClearingOperationByPartition(
        IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier
    )
        external
        override
        onlyRole(_CLEARING_VALIDATOR_ROLE)
        onlyUnpaused
        onlyDefaultPartitionWithSinglePartition(_clearingOperationIdentifier.partition)
        onlyWithValidClearingId(_clearingOperationIdentifier)
        onlyClearingActivated
        validateExpirationTimestamp(_clearingOperationIdentifier, false)
        returns (bool success_)
    {
        bytes memory operationData;
        (success_, operationData) = _approveClearingOperationByPartition(_clearingOperationIdentifier);

        emit ClearingOperationApproved(
            _msgSender(),
            _clearingOperationIdentifier.tokenHolder,
            _clearingOperationIdentifier.partition,
            _clearingOperationIdentifier.clearingId,
            _clearingOperationIdentifier.clearingOperationType,
            operationData
        );
    }

    function cancelClearingOperationByPartition(
        IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier
    )
        external
        override
        onlyRole(_CLEARING_VALIDATOR_ROLE)
        onlyUnpaused
        onlyDefaultPartitionWithSinglePartition(_clearingOperationIdentifier.partition)
        onlyWithValidClearingId(_clearingOperationIdentifier)
        onlyClearingActivated
        validateExpirationTimestamp(_clearingOperationIdentifier, false)
        returns (bool success_)
    {
        success_ = _cancelClearingOperationByPartition(_clearingOperationIdentifier);
        emit ClearingOperationCanceled(
            _msgSender(),
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
        onlyIdentified(_clearingOperationIdentifier.tokenHolder, address(0))
        onlyClearingActivated
        validateExpirationTimestamp(_clearingOperationIdentifier, true)
        returns (bool success_)
    {
        success_ = _reclaimClearingOperationByPartition(_clearingOperationIdentifier);
        emit ClearingOperationReclaimed(
            _msgSender(),
            _clearingOperationIdentifier.tokenHolder,
            _clearingOperationIdentifier.partition,
            _clearingOperationIdentifier.clearingId,
            _clearingOperationIdentifier.clearingOperationType
        );
    }

    function isClearingActivated() external view returns (bool) {
        return _isClearingActivated();
    }
}
