// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ClearingStorageWrapper } from "../asset/ClearingStorageWrapper.sol";
import { AdjustBalancesStorageWrapper } from "../asset/AdjustBalancesStorageWrapper.sol";
import { TokenCoreOps } from "./TokenCoreOps.sol";
import { NonceStorageWrapper } from "../core/NonceStorageWrapper.sol";
import { ProtectedPartitionsStorageWrapper } from "../core/ProtectedPartitionsStorageWrapper.sol";
import { IClearing } from "../../facets/layer_1/clearing/IClearing.sol";
import { IClearingStorageWrapper } from "../asset/clearing/IClearingStorageWrapper.sol";
import { Hold } from "../../facets/layer_1/hold/IHold.sol";
import { ThirdPartyType } from "../asset/types/ThirdPartyType.sol";
import { _checkNounceAndDeadline } from "../../infrastructure/utils/ERC712.sol";
import { LowLevelCall } from "../../infrastructure/utils/LowLevelCall.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";

/// @title ClearingOps - Orchestrator for clearing state-changing operations
/// @notice Deployed once as a separate contract. Facets call via DELEGATECALL.
/// @dev Uses TokenCoreOps for token operations (avoids inlining), ClearingStorageWrapper for clearing data.
library ClearingOps {
    using LowLevelCall for address;

    // ============================================================================
    // CLEARING CREATION OPERATIONS
    // ============================================================================

    function clearingTransferCreation(
        IClearing.ClearingOperation memory _clearingOperation,
        uint256 _amount,
        address _to,
        address _from,
        bytes memory _operatorData,
        ThirdPartyType _thirdPartyType
    ) public returns (bool success_, uint256 clearingId_) {
        bytes32 partition = _clearingOperation.partition;

        clearingId_ = ClearingStorageWrapper.increaseClearingId(
            _from,
            partition,
            IClearing.ClearingOperationType.Transfer
        );

        beforeClearingOperation(
            ClearingStorageWrapper.buildClearingOperationIdentifier(
                _from,
                partition,
                clearingId_,
                IClearing.ClearingOperationType.Transfer
            ),
            address(0)
        );

        TokenCoreOps.reduceBalanceByPartition(_from, _amount, partition);
        ClearingStorageWrapper.increaseClearedAmounts(_from, partition, _amount);

        ClearingStorageWrapper.setClearingTransferData(
            _from,
            partition,
            clearingId_,
            _amount,
            _clearingOperation.expirationTimestamp,
            _to,
            _clearingOperation.data,
            _operatorData,
            _thirdPartyType
        );

        emitClearedTransferEvent(
            _from,
            _to,
            partition,
            clearingId_,
            _amount,
            _clearingOperation.expirationTimestamp,
            _clearingOperation.data,
            _operatorData,
            _thirdPartyType
        );

        success_ = true;
    }

    function clearingRedeemCreation(
        IClearing.ClearingOperation memory _clearingOperation,
        uint256 _amount,
        address _from,
        bytes memory _operatorData,
        ThirdPartyType _thirdPartyType
    ) public returns (bool success_, uint256 clearingId_) {
        bytes32 partition = _clearingOperation.partition;

        clearingId_ = ClearingStorageWrapper.increaseClearingId(
            _from,
            partition,
            IClearing.ClearingOperationType.Redeem
        );

        beforeClearingOperation(
            ClearingStorageWrapper.buildClearingOperationIdentifier(
                _from,
                partition,
                clearingId_,
                IClearing.ClearingOperationType.Redeem
            ),
            address(0)
        );

        TokenCoreOps.reduceBalanceByPartition(_from, _amount, partition);
        ClearingStorageWrapper.increaseClearedAmounts(_from, partition, _amount);

        ClearingStorageWrapper.setClearingRedeemData(
            _from,
            partition,
            clearingId_,
            _amount,
            _clearingOperation.expirationTimestamp,
            _clearingOperation.data,
            _operatorData,
            _thirdPartyType
        );

        emitClearedRedeemEvent(
            _from,
            partition,
            clearingId_,
            _amount,
            _clearingOperation.expirationTimestamp,
            _clearingOperation.data,
            _operatorData,
            _thirdPartyType
        );

        success_ = true;
    }

    function clearingHoldCreationCreation(
        IClearing.ClearingOperation memory _clearingOperation,
        address _from,
        Hold calldata _hold,
        bytes memory _operatorData,
        ThirdPartyType _thirdPartyType
    ) public returns (bool success_, uint256 clearingId_) {
        bytes32 partition = _clearingOperation.partition;

        clearingId_ = ClearingStorageWrapper.increaseClearingId(
            _from,
            partition,
            IClearing.ClearingOperationType.HoldCreation
        );

        beforeClearingOperation(
            ClearingStorageWrapper.buildClearingOperationIdentifier(
                _from,
                partition,
                clearingId_,
                IClearing.ClearingOperationType.HoldCreation
            ),
            address(0)
        );

        TokenCoreOps.reduceBalanceByPartition(_from, _hold.amount, partition);
        ClearingStorageWrapper.increaseClearedAmounts(_from, partition, _hold.amount);

        ClearingStorageWrapper.setClearingHoldCreationData(
            _from,
            partition,
            clearingId_,
            _hold.amount,
            _clearingOperation.expirationTimestamp,
            _hold.expirationTimestamp,
            _clearingOperation.data,
            _hold.data,
            _hold.escrow,
            _hold.to,
            _operatorData,
            _thirdPartyType
        );

        emitClearedHoldByPartitionEvent(
            _from,
            partition,
            clearingId_,
            _hold,
            _clearingOperation.expirationTimestamp,
            _clearingOperation.data,
            _operatorData,
            _thirdPartyType
        );

        success_ = true;
    }

    // ============================================================================
    // CLEARING ACTIONS (approve / cancel / reclaim)
    // ============================================================================

    function approveClearingOperationByPartition(
        IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier
    ) public returns (bool success_, bytes memory operationData_, bytes32 partition_) {
        return handleClearingOperationByPartition(_clearingOperationIdentifier);
    }

    function cancelClearingOperationByPartition(
        IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier
    ) public returns (bool success_) {
        (success_, , ) = handleClearingOperationByPartition(_clearingOperationIdentifier);
    }

    function reclaimClearingOperationByPartition(
        IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier
    ) public returns (bool success_) {
        (success_, , ) = handleClearingOperationByPartition(_clearingOperationIdentifier);
    }

    // ============================================================================
    // PROTECTED CLEARING OPERATIONS (EIP-712)
    // ============================================================================

    function protectedClearingTransferByPartition(
        IClearing.ProtectedClearingOperation calldata _protectedClearingOperation,
        uint256 _amount,
        address _to,
        bytes calldata _signature
    ) public returns (bool success_, uint256 clearingId_) {
        _checkNounceAndDeadline(
            _protectedClearingOperation.nonce,
            _protectedClearingOperation.from,
            NonceStorageWrapper.getNonceFor(_protectedClearingOperation.from),
            _protectedClearingOperation.deadline,
            TimeTravelStorageWrapper.getBlockTimestamp()
        );

        ProtectedPartitionsStorageWrapper.checkClearingTransferSignature(
            _protectedClearingOperation,
            _amount,
            _to,
            _signature,
            TokenCoreOps.getTokenName()
        );

        NonceStorageWrapper.setNonceFor(_protectedClearingOperation.nonce, _protectedClearingOperation.from);

        (success_, clearingId_) = clearingTransferCreation(
            _protectedClearingOperation.clearingOperation,
            _amount,
            _to,
            _protectedClearingOperation.from,
            "",
            ThirdPartyType.PROTECTED
        );
    }

    function protectedClearingRedeemByPartition(
        IClearing.ProtectedClearingOperation calldata _protectedClearingOperation,
        uint256 _amount,
        bytes calldata _signature
    ) public returns (bool success_, uint256 clearingId_) {
        _checkNounceAndDeadline(
            _protectedClearingOperation.nonce,
            _protectedClearingOperation.from,
            NonceStorageWrapper.getNonceFor(_protectedClearingOperation.from),
            _protectedClearingOperation.deadline,
            TimeTravelStorageWrapper.getBlockTimestamp()
        );

        ProtectedPartitionsStorageWrapper.checkClearingRedeemSignature(
            _protectedClearingOperation,
            _amount,
            _signature,
            TokenCoreOps.getTokenName()
        );

        NonceStorageWrapper.setNonceFor(_protectedClearingOperation.nonce, _protectedClearingOperation.from);

        (success_, clearingId_) = clearingRedeemCreation(
            _protectedClearingOperation.clearingOperation,
            _amount,
            _protectedClearingOperation.from,
            "",
            ThirdPartyType.PROTECTED
        );
    }

    function protectedClearingCreateHoldByPartition(
        IClearing.ProtectedClearingOperation calldata _protectedClearingOperation,
        Hold calldata _hold,
        bytes calldata _signature
    ) public returns (bool success_, uint256 clearingId_) {
        _checkNounceAndDeadline(
            _protectedClearingOperation.nonce,
            _protectedClearingOperation.from,
            NonceStorageWrapper.getNonceFor(_protectedClearingOperation.from),
            _protectedClearingOperation.deadline,
            TimeTravelStorageWrapper.getBlockTimestamp()
        );

        ProtectedPartitionsStorageWrapper.checkClearingCreateHoldSignature(
            _protectedClearingOperation,
            _hold,
            _signature,
            TokenCoreOps.getTokenName()
        );

        NonceStorageWrapper.setNonceFor(_protectedClearingOperation.nonce, _protectedClearingOperation.from);

        (success_, clearingId_) = clearingHoldCreationCreation(
            _protectedClearingOperation.clearingOperation,
            _protectedClearingOperation.from,
            _hold,
            "",
            ThirdPartyType.PROTECTED
        );
    }

    // ============================================================================
    // ALLOWANCE OPERATIONS
    // ============================================================================

    function decreaseAllowedBalanceForClearing(
        bytes32 _partition,
        uint256 _clearingId,
        IClearing.ClearingOperationType _clearingOperationType,
        address _from,
        uint256 _amount
    ) public {
        address spender = ClearingStorageWrapper.getClearingThirdParty(
            _partition,
            _from,
            _clearingOperationType,
            _clearingId
        );
        TokenCoreOps.decreaseAllowedBalance(_from, spender, _amount);
    }

    // ============================================================================
    // INTERNAL: CLEARING OPERATION HANDLING
    // ============================================================================

    function handleClearingOperationByPartition(
        IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier
    ) internal returns (bool success_, bytes memory operationData_, bytes32 partition_) {
        partition_ = _clearingOperationIdentifier.partition;

        IClearing.ClearingOperationBasicInfo memory data = ClearingStorageWrapper.isClearingBasicInfo(
            _clearingOperationIdentifier
        );

        if (_clearingOperationIdentifier.clearingOperationType == IClearing.ClearingOperationType.Transfer) {
            (success_, operationData_) = clearingTransferExecution(_clearingOperationIdentifier, data);
        } else if (_clearingOperationIdentifier.clearingOperationType == IClearing.ClearingOperationType.Redeem) {
            (success_, operationData_) = clearingRedeemExecution(_clearingOperationIdentifier, data);
        } else {
            (success_, operationData_) = clearingHoldCreationExecution(_clearingOperationIdentifier, data);
        }
    }

    function clearingTransferExecution(
        IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier,
        IClearing.ClearingOperationBasicInfo memory data
    ) internal returns (bool success_, bytes memory operationData_) {
        address destination = data.destination;
        adjustClearingBalances(_clearingOperationIdentifier, destination, data.amount);

        if (_clearingOperationIdentifier.tokenHolder != destination) {
            TokenCoreOps.checkIdentity(_clearingOperationIdentifier.tokenHolder, destination);
            TokenCoreOps.checkCompliance(_clearingOperationIdentifier.tokenHolder, destination, false);
        }

        ClearingStorageWrapper.removeClearing(_clearingOperationIdentifier);

        operationData_ = abi.encode(data.amount, data.expirationTimestamp, destination);

        success_ = true;
    }

    function clearingRedeemExecution(
        IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier,
        IClearing.ClearingOperationBasicInfo memory data
    ) internal returns (bool success_, bytes memory operationData_) {
        adjustClearingBalances(_clearingOperationIdentifier, address(0), data.amount);

        TokenCoreOps.checkIdentity(_clearingOperationIdentifier.tokenHolder, address(0));
        TokenCoreOps.checkCompliance(_clearingOperationIdentifier.tokenHolder, address(0), false);

        ClearingStorageWrapper.removeClearing(_clearingOperationIdentifier);

        operationData_ = abi.encode(data.amount, data.expirationTimestamp);

        success_ = true;
    }

    function clearingHoldCreationExecution(
        IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier,
        IClearing.ClearingOperationBasicInfo memory data
    ) internal returns (bool success_, bytes memory operationData_) {
        address destination = data.destination;
        adjustClearingBalances(_clearingOperationIdentifier, destination, data.amount);

        ClearingStorageWrapper.removeClearing(_clearingOperationIdentifier);

        operationData_ = abi.encode(data.amount, data.expirationTimestamp, destination);

        success_ = true;
    }

    // ============================================================================
    // INTERNAL: BALANCE ADJUSTMENTS
    // ============================================================================

    function adjustClearingBalances(
        IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier,
        address _to,
        uint256 _amount
    ) internal {
        bytes32 partition = _clearingOperationIdentifier.partition;
        address _from = _clearingOperationIdentifier.tokenHolder;

        ClearingStorageWrapper.multiplyTotalClearedAmount(_from, _amount);
        ClearingStorageWrapper.multiplyTotalClearedAmountByPartition(_from, partition, _amount);

        if (_to != address(0)) {
            transferClearingBalance(partition, _to, _amount);
        }
    }

    function transferClearingBalance(bytes32 _partition, address _to, uint256 _amount) internal {
        if (TokenCoreOps.validPartitionForReceiver(_partition, _to)) {
            TokenCoreOps.increaseBalanceByPartition(_to, _amount, _partition);
            TokenCoreOps.emitTransferByPartition(_partition, msg.sender, address(0), _to, _amount, "", "");
            TokenCoreOps.emitTransfer(address(0), _to, _amount);
        } else {
            TokenCoreOps.addPartitionTo(_amount, _to, _partition);
            TokenCoreOps.emitTransferByPartition(_partition, msg.sender, address(0), _to, _amount, "", "");
            TokenCoreOps.emitTransfer(address(0), _to, _amount);
        }
    }

    // ============================================================================
    // INTERNAL: BEFORE/AFTER OPERATIONS
    // ============================================================================

    function beforeClearingOperation(
        IClearing.ClearingOperationIdentifier memory _clearingOperationIdentifier,
        address _destination
    ) internal {
        TokenCoreOps.updateAccountSnapshot(
            _clearingOperationIdentifier.tokenHolder,
            _clearingOperationIdentifier.partition
        );
        TokenCoreOps.updateAccountSnapshot(_destination, _clearingOperationIdentifier.partition);
        TokenCoreOps.updateAccountClearedBalancesSnapshot(
            _clearingOperationIdentifier.tokenHolder,
            _clearingOperationIdentifier.partition
        );
    }

    function updateClearing(
        IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier,
        bytes32 _partition,
        address _tokenHolder
    ) internal returns (uint256 abaf_) {
        TokenCoreOps.triggerAndSyncAll(_partition, _clearingOperationIdentifier.tokenHolder, address(0));

        uint256 clearingLabaf = AdjustBalancesStorageWrapper.getClearingLabafById(_clearingOperationIdentifier);
        uint256 _abaf = AdjustBalancesStorageWrapper.getAbaf();

        abaf_ = _abaf;

        uint256 factor = AdjustBalancesStorageWrapper.calculateFactor(_abaf, clearingLabaf);

        AdjustBalancesStorageWrapper.setClearedLabafById(_clearingOperationIdentifier, _abaf);
        ClearingStorageWrapper.increaseClearedAmounts(_tokenHolder, _partition, factor);
    }

    function updateTotalCleared(bytes32 _partition, address _tokenHolder) internal returns (uint256 abaf_) {
        abaf_ = AdjustBalancesStorageWrapper.getAbaf();

        uint256 labaf = AdjustBalancesStorageWrapper.getTotalClearedLabaf(_tokenHolder);
        uint256 labafByPartition = AdjustBalancesStorageWrapper.getTotalClearedLabafByPartition(
            _partition,
            _tokenHolder
        );

        if (labaf != abaf_) {
            AdjustBalancesStorageWrapper.setTotalClearedLabaf(_tokenHolder, abaf_);
        }

        if (labafByPartition != abaf_) {
            AdjustBalancesStorageWrapper.setTotalClearedLabafByPartition(_partition, _tokenHolder, abaf_);
        }
    }

    function restoreAllowanceAndRemoveClearing(
        IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier
    ) internal returns (uint256 amount_) {
        IClearing.ClearingOperationBasicInfo memory data = ClearingStorageWrapper.isClearingBasicInfo(
            _clearingOperationIdentifier
        );
        amount_ = data.amount;

        restoreClearingAllowance(_clearingOperationIdentifier, amount_);
        ClearingStorageWrapper.removeClearing(_clearingOperationIdentifier);
    }

    function restoreClearingAllowance(
        IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier,
        uint256 _amount
    ) internal {
        ThirdPartyType operatorType = ClearingStorageWrapper.getClearingThirdPartyType(_clearingOperationIdentifier);

        if (operatorType == ThirdPartyType.AUTHORIZED || operatorType == ThirdPartyType.OPERATOR) {
            address spender = ClearingStorageWrapper.getClearingThirdParty(
                _clearingOperationIdentifier.partition,
                _clearingOperationIdentifier.tokenHolder,
                _clearingOperationIdentifier.clearingOperationType,
                _clearingOperationIdentifier.clearingId
            );
            TokenCoreOps.increaseAllowedBalance(_clearingOperationIdentifier.tokenHolder, spender, _amount);
        }
    }

    // ============================================================================
    // INTERNAL: EVENT EMISSIONS
    // ============================================================================

    function emitClearedTransferEvent(
        address _from,
        address _to,
        bytes32 _partition,
        uint256 _clearingId,
        uint256 _amount,
        uint256 _expirationTimestamp,
        bytes memory _data,
        bytes memory _operatorData,
        ThirdPartyType /* _operatorType */
    ) internal {
        emit IClearingStorageWrapper.ClearedTransferByPartition(
            msg.sender,
            _from,
            _to,
            _partition,
            _clearingId,
            _amount,
            _expirationTimestamp,
            _data,
            _operatorData
        );
    }

    function emitClearedRedeemEvent(
        address _from,
        bytes32 _partition,
        uint256 _clearingId,
        uint256 _amount,
        uint256 _expirationTimestamp,
        bytes memory _data,
        bytes memory _operatorData,
        ThirdPartyType /* _operatorType */
    ) internal {
        emit IClearingStorageWrapper.ClearedRedeemByPartition(
            msg.sender,
            _from,
            _partition,
            _clearingId,
            _amount,
            _expirationTimestamp,
            _data,
            _operatorData
        );
    }

    function emitClearedHoldByPartitionEvent(
        address _from,
        bytes32 _partition,
        uint256 _clearingId,
        Hold calldata _hold,
        uint256 _expirationTimestamp,
        bytes memory _data,
        bytes memory _operatorData,
        ThirdPartyType /* _operatorType */
    ) internal {
        emit IClearingStorageWrapper.ClearedHoldByPartition(
            msg.sender,
            _from,
            _partition,
            _clearingId,
            _hold,
            _expirationTimestamp,
            _data,
            _operatorData
        );
    }
}
