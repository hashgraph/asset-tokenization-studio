// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// Domain Libraries
import { LibABAF } from "../domain/LibABAF.sol";
import { LibERC1410 } from "../domain/LibERC1410.sol";
import { LibERC20 } from "../domain/LibERC20.sol";
import { LibClearing } from "../domain/LibClearing.sol";
import { LibERC1594 } from "../domain/LibERC1594.sol";

// Core Libraries
import { LibCompliance } from "../core/LibCompliance.sol";
import { LibERC712 } from "../core/LibERC712.sol";
import { LibNonce } from "../core/LibNonce.sol";
import { LibProtectedPartitions } from "../core/LibProtectedPartitions.sol";

// Interfaces
import { IERC3643Management } from "../../facets/features/interfaces/ERC3643/IERC3643Management.sol";
import { ICompliance } from "../../facets/features/interfaces/ERC3643/ICompliance.sol";
import { IHoldBase } from "../../facets/features/interfaces/hold/IHoldBase.sol";
import { IClearing } from "../../facets/features/interfaces/clearing/IClearing.sol";
import { IClearingActions } from "../../facets/features/interfaces/clearing/IClearingActions.sol";
import { IClearingTransfer } from "../../facets/features/interfaces/clearing/IClearingTransfer.sol";
import { IClearingRedeem } from "../../facets/features/interfaces/clearing/IClearingRedeem.sol";
import { IClearingHoldCreation } from "../../facets/features/interfaces/clearing/IClearingHoldCreation.sol";
import { ThirdPartyType } from "../../facets/features/types/ThirdPartyType.sol";

// Utilities
import { LibLowLevelCall } from "../../infrastructure/lib/LibLowLevelCall.sol";
import { _DEFAULT_PARTITION } from "../../constants/values.sol";
import { LibResolverProxy } from "../../infrastructure/proxy/LibResolverProxy.sol";

// Orchestrator Libraries
import { HoldOps } from "./HoldOps.sol";
import { ClearingReadOps } from "./ClearingReadOps.sol";

/// @title ClearingOps
/// @notice Clearing orchestration library - deployed once and called via DELEGATECALL
/// @dev Contains ONLY orchestration logic (coordination between domain libraries)
///      - Events are emitted here for clearing creation operations
///      - EIP-712 validation is done here for protected operations
///      Accepts _blockTimestamp as parameter (dependency injection)
library ClearingOps {
    using LibLowLevelCall for address;

    // ==========================================================================
    // CLEARING CREATION OPERATIONS
    // ==========================================================================

    /// @notice Create a clearing transfer operation
    function clearingTransferCreation(
        IClearing.ClearingOperation memory _clearingOperation,
        uint256 _amount,
        address _to,
        address _from,
        bytes memory _operatorData,
        ThirdPartyType _thirdPartyType
    ) public returns (bool success_, uint256 clearingId_) {
        clearingId_ = _operateClearingCreation(
            _clearingOperation,
            _from,
            _amount,
            IClearing.ClearingOperationType.Transfer
        );
        LibClearing.setClearingTransferDataStruct(
            _from,
            _clearingOperation.partition,
            clearingId_,
            IClearingTransfer.ClearingTransferData({
                amount: _amount,
                expirationTimestamp: _clearingOperation.expirationTimestamp,
                destination: _to,
                data: _clearingOperation.data,
                operatorData: _operatorData,
                operatorType: _thirdPartyType
            })
        );
        _emitClearedTransferEvent(
            _from,
            _to,
            _clearingOperation.partition,
            clearingId_,
            _amount,
            _clearingOperation.expirationTimestamp,
            _clearingOperation.data,
            _operatorData,
            _thirdPartyType
        );
        success_ = true;
    }

    /// @notice Create a clearing redeem operation
    function clearingRedeemCreation(
        IClearing.ClearingOperation memory _clearingOperation,
        uint256 _amount,
        address _from,
        bytes memory _operatorData,
        ThirdPartyType _thirdPartyType
    ) public returns (bool success_, uint256 clearingId_) {
        clearingId_ = _operateClearingCreation(
            _clearingOperation,
            _from,
            _amount,
            IClearing.ClearingOperationType.Redeem
        );
        LibClearing.setClearingRedeemDataStruct(
            _from,
            _clearingOperation.partition,
            clearingId_,
            IClearingRedeem.ClearingRedeemData({
                amount: _amount,
                expirationTimestamp: _clearingOperation.expirationTimestamp,
                data: _clearingOperation.data,
                operatorData: _operatorData,
                operatorType: _thirdPartyType
            })
        );
        _emitClearedRedeemEvent(
            _from,
            _clearingOperation.partition,
            clearingId_,
            _amount,
            _clearingOperation.expirationTimestamp,
            _clearingOperation.data,
            _operatorData,
            _thirdPartyType
        );
        success_ = true;
    }

    /// @notice Create a clearing hold creation operation
    function clearingHoldCreationCreation(
        IClearing.ClearingOperation memory _clearingOperation,
        address _from,
        IHoldBase.Hold calldata _hold,
        bytes memory _operatorData,
        ThirdPartyType _thirdPartyType
    ) public returns (bool success_, uint256 clearingId_) {
        clearingId_ = _operateClearingCreation(
            _clearingOperation,
            _from,
            _hold.amount,
            IClearing.ClearingOperationType.HoldCreation
        );
        LibClearing.setClearingHoldCreationDataStruct(
            _from,
            _clearingOperation.partition,
            clearingId_,
            IClearingHoldCreation.ClearingHoldCreationData({
                amount: _hold.amount,
                expirationTimestamp: _clearingOperation.expirationTimestamp,
                data: _clearingOperation.data,
                holdEscrow: _hold.escrow,
                holdExpirationTimestamp: _hold.expirationTimestamp,
                holdTo: _hold.to,
                holdData: _hold.data,
                operatorData: _operatorData,
                operatorType: _thirdPartyType
            })
        );
        _emitClearedHoldByPartitionEvent(
            _from,
            _clearingOperation.partition,
            clearingId_,
            _hold,
            _clearingOperation.expirationTimestamp,
            _clearingOperation.data,
            _operatorData,
            _thirdPartyType
        );
        success_ = true;
    }

    // ==========================================================================
    // CLEARING ACTION OPERATIONS
    // ==========================================================================

    /// @notice Approve a clearing operation
    function approveClearingOperationByPartition(
        IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier
    ) public returns (bool success_, bytes memory operationData_, bytes32 partition_) {
        (success_, , , operationData_, partition_) = _handleClearingOperationByPartition(
            _clearingOperationIdentifier,
            IClearingActions.ClearingActionType.Approve
        );
    }

    /// @notice Cancel a clearing operation
    function cancelClearingOperationByPartition(
        IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier
    ) public returns (bool success_) {
        (success_, , , , ) = _handleClearingOperationByPartition(
            _clearingOperationIdentifier,
            IClearingActions.ClearingActionType.Cancel
        );
    }

    /// @notice Reclaim a clearing operation
    function reclaimClearingOperationByPartition(
        IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier
    ) public returns (bool success_) {
        (success_, , , , ) = _handleClearingOperationByPartition(
            _clearingOperationIdentifier,
            IClearingActions.ClearingActionType.Reclaim
        );
    }

    // ==========================================================================
    // CLEARING ALLOWANCE MANAGEMENT
    // ==========================================================================

    /// @notice Decrease allowed balance for an authorized third-party clearing
    function decreaseAllowedBalanceForClearing(
        bytes32 _partition,
        uint256 _clearingId,
        IClearing.ClearingOperationType _clearingOperationType,
        address _from,
        uint256 _amount
    ) public {
        address spender = msg.sender;
        LibERC20.spendAllowance(_from, spender, _amount);
        LibClearing.setClearingThirdParty(_partition, _clearingId, _clearingOperationType, _from, spender);
    }

    // ==========================================================================
    // PROTECTED CLEARING OPERATIONS (EIP-712 signature verification)
    // ==========================================================================

    /// @notice Protected clearing transfer with EIP-712 signature verification
    function protectedClearingTransferByPartition(
        IClearing.ProtectedClearingOperation calldata _protectedClearingOperation,
        uint256 _amount,
        address _to,
        bytes calldata _signature,
        uint256 _blockTimestamp
    ) public returns (bool success_, uint256 clearingId_) {
        LibERC712.checkNounceAndDeadline(
            _protectedClearingOperation.nonce,
            _protectedClearingOperation.from,
            LibNonce.getNonceFor(_protectedClearingOperation.from),
            _protectedClearingOperation.deadline,
            _blockTimestamp
        );
        LibProtectedPartitions.checkClearingTransferSignature(
            _protectedClearingOperation,
            _amount,
            _to,
            _signature,
            LibERC20.getName(),
            LibResolverProxy.getVersion(),
            block.chainid,
            address(this)
        );
        LibNonce.setNonceFor(_protectedClearingOperation.nonce, _protectedClearingOperation.from);
        return
            clearingTransferCreation(
                _protectedClearingOperation.clearingOperation,
                _amount,
                _to,
                _protectedClearingOperation.from,
                "",
                ThirdPartyType.PROTECTED
            );
    }

    /// @notice Protected clearing redeem with EIP-712 signature verification
    function protectedClearingRedeemByPartition(
        IClearing.ProtectedClearingOperation calldata _protectedClearingOperation,
        uint256 _amount,
        bytes calldata _signature,
        uint256 _blockTimestamp
    ) public returns (bool success_, uint256 clearingId_) {
        LibERC712.checkNounceAndDeadline(
            _protectedClearingOperation.nonce,
            _protectedClearingOperation.from,
            LibNonce.getNonceFor(_protectedClearingOperation.from),
            _protectedClearingOperation.deadline,
            _blockTimestamp
        );
        LibProtectedPartitions.checkClearingRedeemSignature(
            _protectedClearingOperation,
            _amount,
            _signature,
            LibERC20.getName(),
            LibResolverProxy.getVersion(),
            block.chainid,
            address(this)
        );
        LibNonce.setNonceFor(_protectedClearingOperation.nonce, _protectedClearingOperation.from);
        return
            clearingRedeemCreation(
                _protectedClearingOperation.clearingOperation,
                _amount,
                _protectedClearingOperation.from,
                "",
                ThirdPartyType.PROTECTED
            );
    }

    /// @notice Protected clearing hold creation with EIP-712 signature verification
    function protectedClearingCreateHoldByPartition(
        IClearing.ProtectedClearingOperation memory _protectedClearingOperation,
        IHoldBase.Hold calldata _hold,
        bytes calldata _signature,
        uint256 _blockTimestamp
    ) public returns (bool success_, uint256 clearingId_) {
        LibERC712.checkNounceAndDeadline(
            _protectedClearingOperation.nonce,
            _protectedClearingOperation.from,
            LibNonce.getNonceFor(_protectedClearingOperation.from),
            _protectedClearingOperation.deadline,
            _blockTimestamp
        );
        LibProtectedPartitions.checkClearingCreateHoldSignature(
            _protectedClearingOperation,
            _hold,
            _signature,
            LibERC20.getName(),
            LibResolverProxy.getVersion(),
            block.chainid,
            address(this)
        );
        LibNonce.setNonceFor(_protectedClearingOperation.nonce, _protectedClearingOperation.from);
        return
            clearingHoldCreationCreation(
                _protectedClearingOperation.clearingOperation,
                _protectedClearingOperation.from,
                _hold,
                "",
                ThirdPartyType.PROTECTED
            );
    }

    // ==========================================================================
    // PRIVATE HELPERS - Core Logic
    // ==========================================================================

    /// @notice Core clearing creation logic
    function _operateClearingCreation(
        IClearing.ClearingOperation memory _clearingOperation,
        address _from,
        uint256 _amount,
        IClearing.ClearingOperationType _operationType
    ) private returns (uint256 clearingId_) {
        bytes32 partition = _clearingOperation.partition;
        clearingId_ = LibClearing.getAndIncrementNextClearingId(_from, partition, _operationType);
        ClearingReadOps.beforeClearingOperation(
            _buildClearingOperationIdentifier(_from, partition, clearingId_, _operationType),
            address(0)
        );
        LibERC1410.reduceBalanceByPartition(_from, _amount, partition);
        LibClearing.increaseClearedAmounts(_from, partition, _amount);
    }

    /// @notice Handle clearing operation by partition (approve/cancel/reclaim)
    function _handleClearingOperationByPartition(
        IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier,
        IClearingActions.ClearingActionType operationType
    )
        private
        returns (
            bool success_,
            uint256 amount_,
            ThirdPartyType operatorType_,
            bytes memory operationData_,
            bytes32 partition_
        )
    {
        IClearing.ClearingOperationIdentifier memory id = _buildClearingOperationIdentifier(
            _clearingOperationIdentifier.tokenHolder,
            _clearingOperationIdentifier.partition,
            _clearingOperationIdentifier.clearingId,
            _clearingOperationIdentifier.clearingOperationType
        );
        address destination = _getClearingDestination(id);
        ClearingReadOps.beforeClearingOperation(id, destination);
        (success_, amount_, operatorType_, operationData_, partition_) = _operateClearingAction(
            _clearingOperationIdentifier,
            operationType
        );
        _restoreAllowanceAndRemoveClearing(operationType, operatorType_, _clearingOperationIdentifier, amount_);
    }

    /// @notice Execute clearing action based on operation type
    function _operateClearingAction(
        IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier,
        IClearingActions.ClearingActionType _operation
    )
        private
        returns (
            bool success_,
            uint256 amount_,
            ThirdPartyType operatorType_,
            bytes memory operationData_,
            bytes32 partition_
        )
    {
        if (_clearingOperationIdentifier.clearingOperationType == IClearing.ClearingOperationType.Transfer) {
            (success_, amount_, operatorType_, partition_) = _clearingTransferExecution(
                _clearingOperationIdentifier.partition,
                _clearingOperationIdentifier.tokenHolder,
                _clearingOperationIdentifier.clearingId,
                _operation
            );
            return (success_, amount_, operatorType_, operationData_, partition_);
        }
        if (_clearingOperationIdentifier.clearingOperationType == IClearing.ClearingOperationType.Redeem) {
            (success_, amount_, operatorType_) = _clearingRedeemExecution(
                _clearingOperationIdentifier.partition,
                _clearingOperationIdentifier.tokenHolder,
                _clearingOperationIdentifier.clearingId,
                _operation
            );
            return (success_, amount_, operatorType_, operationData_, bytes32(0));
        }
        (success_, amount_, operatorType_, operationData_) = _clearingHoldCreationExecution(
            _clearingOperationIdentifier.partition,
            _clearingOperationIdentifier.tokenHolder,
            _clearingOperationIdentifier.clearingId,
            _operation
        );
        return (success_, amount_, operatorType_, operationData_, bytes32(0));
    }

    // ==========================================================================
    // PRIVATE HELPERS - Clearing Execution
    // ==========================================================================

    /// @notice Execute clearing transfer
    function _clearingTransferExecution(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId,
        IClearingActions.ClearingActionType _operation
    ) private returns (bool success_, uint256 amount_, ThirdPartyType operatorType_, bytes32 partition_) {
        IClearingTransfer.ClearingTransferData memory ctd = LibClearing.getClearingTransferData(
            _partition,
            _tokenHolder,
            _clearingId
        );
        address destination = _tokenHolder;
        if (_operation == IClearingActions.ClearingActionType.Approve) {
            LibERC1594.checkIdentity(_tokenHolder, ctd.destination);
            LibERC1594.checkCompliance(msg.sender, _tokenHolder, ctd.destination, false);
            destination = ctd.destination;
            partition_ = _partition;
        }
        _transferClearingBalance(_partition, destination, ctd.amount);
        if (
            _tokenHolder != destination &&
            address(LibCompliance.getCompliance()) != address(0) &&
            _partition == _DEFAULT_PARTITION
        ) {
            address(LibCompliance.getCompliance()).functionCall(
                abi.encodeWithSelector(ICompliance.transferred.selector, _tokenHolder, destination, ctd.amount),
                IERC3643Management.ComplianceCallFailed.selector
            );
        }
        success_ = true;
        amount_ = ctd.amount;
        operatorType_ = ctd.operatorType;
    }

    /// @notice Execute clearing redeem
    function _clearingRedeemExecution(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId,
        IClearingActions.ClearingActionType _operation
    ) private returns (bool success_, uint256 amount_, ThirdPartyType operatorType_) {
        IClearingRedeem.ClearingRedeemData memory crd = LibClearing.getClearingRedeemData(
            _partition,
            _tokenHolder,
            _clearingId
        );
        if (_operation == IClearingActions.ClearingActionType.Approve) {
            LibERC1594.checkIdentity(_tokenHolder, address(0));
            LibERC1594.checkCompliance(msg.sender, _tokenHolder, address(0), false);
        } else {
            _transferClearingBalance(_partition, _tokenHolder, crd.amount);
        }
        success_ = true;
        amount_ = crd.amount;
        operatorType_ = crd.operatorType;
    }

    /// @notice Execute clearing hold creation
    function _clearingHoldCreationExecution(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId,
        IClearingActions.ClearingActionType _operation
    ) private returns (bool success_, uint256 amount_, ThirdPartyType operatorType_, bytes memory operationData_) {
        IClearingHoldCreation.ClearingHoldCreationData memory chcd = LibClearing.getClearingHoldCreationData(
            _partition,
            _tokenHolder,
            _clearingId
        );
        _transferClearingBalance(_partition, _tokenHolder, chcd.amount);
        if (_operation == IClearingActions.ClearingActionType.Approve) {
            IHoldBase.Hold memory hold = IHoldBase.Hold(
                chcd.amount,
                chcd.holdExpirationTimestamp,
                chcd.holdEscrow,
                chcd.holdTo,
                chcd.holdData
            );
            uint256 holdId;
            (, holdId) = HoldOps.createHoldByPartition(
                _partition,
                _tokenHolder,
                hold,
                chcd.operatorData,
                chcd.operatorType
            );
            operationData_ = abi.encode(holdId);
        }
        success_ = true;
        amount_ = chcd.amount;
        operatorType_ = chcd.operatorType;
    }

    // ==========================================================================
    // PRIVATE HELPERS - Balance and Cleanup
    // ==========================================================================

    /// @notice Transfer clearing balance to recipient
    function _transferClearingBalance(bytes32 _partition, address _to, uint256 _amount) private {
        if (LibERC1410.validPartitionForReceiver(_partition, _to)) {
            LibERC1410.increaseBalanceByPartition(_to, _amount, _partition);
            return;
        }
        LibERC1410.addPartitionTo(_amount, _to, _partition);
    }

    /// @notice Remove clearing operation and cleanup
    function _removeClearing(IClearing.ClearingOperationIdentifier memory _clearingOperationIdentifier) private {
        (, uint256 amount, ) = LibClearing.getClearingBasicInfo(_clearingOperationIdentifier);
        LibClearing.decreaseTotalClearedAmounts(
            _clearingOperationIdentifier.tokenHolder,
            _clearingOperationIdentifier.partition,
            amount
        );
        LibClearing.removeClearingId(
            _clearingOperationIdentifier.tokenHolder,
            _clearingOperationIdentifier.partition,
            _clearingOperationIdentifier.clearingOperationType,
            _clearingOperationIdentifier.clearingId
        );
        LibClearing.deleteClearingThirdParty(
            _clearingOperationIdentifier.tokenHolder,
            _clearingOperationIdentifier.partition,
            _clearingOperationIdentifier.clearingOperationType,
            _clearingOperationIdentifier.clearingId
        );
        if (_clearingOperationIdentifier.clearingOperationType == IClearing.ClearingOperationType.Transfer) {
            LibClearing.deleteClearingTransferData(
                _clearingOperationIdentifier.tokenHolder,
                _clearingOperationIdentifier.partition,
                _clearingOperationIdentifier.clearingId
            );
        } else if (_clearingOperationIdentifier.clearingOperationType == IClearing.ClearingOperationType.Redeem) {
            LibClearing.deleteClearingRedeemData(
                _clearingOperationIdentifier.tokenHolder,
                _clearingOperationIdentifier.partition,
                _clearingOperationIdentifier.clearingId
            );
        } else {
            LibClearing.deleteClearingHoldCreationData(
                _clearingOperationIdentifier.tokenHolder,
                _clearingOperationIdentifier.partition,
                _clearingOperationIdentifier.clearingId
            );
        }
        LibABAF.removeLabafClearing(_clearingOperationIdentifier);
    }

    /// @notice Restore allowance and remove clearing after operation
    function _restoreAllowanceAndRemoveClearing(
        IClearingActions.ClearingActionType _operation,
        ThirdPartyType _operatorType,
        IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier,
        uint256 _amount
    ) private {
        _restoreClearingAllowance(_operation, _operatorType, _clearingOperationIdentifier, _amount);
        _removeClearing(
            _buildClearingOperationIdentifier(
                _clearingOperationIdentifier.tokenHolder,
                _clearingOperationIdentifier.partition,
                _clearingOperationIdentifier.clearingId,
                _clearingOperationIdentifier.clearingOperationType
            )
        );
    }

    /// @notice Restore clearing allowance for non-approved operations with authorized third party
    function _restoreClearingAllowance(
        IClearingActions.ClearingActionType _operation,
        ThirdPartyType _operatorType,
        IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier,
        uint256 _amount
    ) private {
        if (!(_operation != IClearingActions.ClearingActionType.Approve && _operatorType == ThirdPartyType.AUTHORIZED))
            return;
        LibERC20.increaseAllowance(
            _clearingOperationIdentifier.tokenHolder,
            LibClearing.getClearingThirdParty(
                _clearingOperationIdentifier.partition,
                _clearingOperationIdentifier.tokenHolder,
                _clearingOperationIdentifier.clearingOperationType,
                _clearingOperationIdentifier.clearingId
            ),
            _amount
        );
    }

    // ==========================================================================
    // PRIVATE HELPERS - Event Emission
    // ==========================================================================

    function _emitClearedTransferEvent(
        address _from,
        address _to,
        bytes32 _partition,
        uint256 _clearingId,
        uint256 _amount,
        uint256 _expirationTimestamp,
        bytes memory _data,
        bytes memory _operatorData,
        ThirdPartyType _thirdPartyType
    ) private {
        if (_thirdPartyType == ThirdPartyType.NULL) {
            emit IClearingTransfer.ClearedTransferByPartition(
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
        } else if (_thirdPartyType == ThirdPartyType.AUTHORIZED) {
            emit IClearingTransfer.ClearedTransferFromByPartition(
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
        } else if (_thirdPartyType == ThirdPartyType.OPERATOR) {
            emit IClearingTransfer.ClearedOperatorTransferByPartition(
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
        } else {
            emit IClearingTransfer.ProtectedClearedTransferByPartition(
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
    }

    function _emitClearedRedeemEvent(
        address _from,
        bytes32 _partition,
        uint256 _clearingId,
        uint256 _amount,
        uint256 _expirationTimestamp,
        bytes memory _data,
        bytes memory _operatorData,
        ThirdPartyType _thirdPartyType
    ) private {
        if (_thirdPartyType == ThirdPartyType.NULL) {
            emit IClearingRedeem.ClearedRedeemByPartition(
                msg.sender,
                _from,
                _partition,
                _clearingId,
                _amount,
                _expirationTimestamp,
                _data,
                _operatorData
            );
        } else if (_thirdPartyType == ThirdPartyType.AUTHORIZED) {
            emit IClearingRedeem.ClearedRedeemFromByPartition(
                msg.sender,
                _from,
                _partition,
                _clearingId,
                _amount,
                _expirationTimestamp,
                _data,
                _operatorData
            );
        } else if (_thirdPartyType == ThirdPartyType.OPERATOR) {
            emit IClearingRedeem.ClearedOperatorRedeemByPartition(
                msg.sender,
                _from,
                _partition,
                _clearingId,
                _amount,
                _expirationTimestamp,
                _data,
                _operatorData
            );
        } else {
            emit IClearingRedeem.ProtectedClearedRedeemByPartition(
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
    }

    function _emitClearedHoldByPartitionEvent(
        address _from,
        bytes32 _partition,
        uint256 _clearingId,
        IHoldBase.Hold calldata _hold,
        uint256 _expirationTimestamp,
        bytes memory _data,
        bytes memory _operatorData,
        ThirdPartyType _thirdPartyType
    ) private {
        if (_thirdPartyType == ThirdPartyType.NULL) {
            emit IClearingHoldCreation.ClearedHoldByPartition(
                msg.sender,
                _from,
                _partition,
                _clearingId,
                _hold,
                _expirationTimestamp,
                _data,
                _operatorData
            );
        } else if (_thirdPartyType == ThirdPartyType.AUTHORIZED) {
            emit IClearingHoldCreation.ClearedHoldFromByPartition(
                msg.sender,
                _from,
                _partition,
                _clearingId,
                _hold,
                _expirationTimestamp,
                _data,
                _operatorData
            );
        } else if (_thirdPartyType == ThirdPartyType.OPERATOR) {
            emit IClearingHoldCreation.ClearedOperatorHoldByPartition(
                msg.sender,
                _from,
                _partition,
                _clearingId,
                _hold,
                _expirationTimestamp,
                _data,
                _operatorData
            );
        } else {
            emit IClearingHoldCreation.ProtectedClearedHoldByPartition(
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

    /// @notice Get clearing destination from identifier
    function _getClearingDestination(IClearing.ClearingOperationIdentifier memory id) private view returns (address) {
        (, , address destination_) = LibClearing.getClearingBasicInfo(id);
        return destination_;
    }

    /// @notice Build clearing operation identifier
    function _buildClearingOperationIdentifier(
        address _from,
        bytes32 _partition,
        uint256 _clearingId,
        IClearing.ClearingOperationType _operationType
    ) private pure returns (IClearing.ClearingOperationIdentifier memory) {
        return
            IClearing.ClearingOperationIdentifier({
                tokenHolder: _from,
                partition: _partition,
                clearingId: _clearingId,
                clearingOperationType: _operationType
            });
    }
}
