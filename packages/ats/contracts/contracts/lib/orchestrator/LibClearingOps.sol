// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IClearing } from "../../facets/features/interfaces/clearing/IClearing.sol";
import { IClearingActions } from "../../facets/features/interfaces/clearing/IClearingActions.sol";
import { IClearingTransfer } from "../../facets/features/interfaces/clearing/IClearingTransfer.sol";
import { IClearingRedeem } from "../../facets/features/interfaces/clearing/IClearingRedeem.sol";
import { IClearingHoldCreation } from "../../facets/features/interfaces/clearing/IClearingHoldCreation.sol";
import { ThirdPartyType } from "../../facets/features/types/ThirdPartyType.sol";
import { ICompliance } from "../../facets/features/interfaces/ERC3643/ICompliance.sol";
import { IERC3643Management } from "../../facets/features/interfaces/ERC3643/IERC3643Management.sol";
import { _DEFAULT_PARTITION } from "../../constants/values.sol";
import { LibLowLevelCall } from "../../infrastructure/lib/LibLowLevelCall.sol";
import { checkNounceAndDeadline } from "../core/ERC712.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { LibClearing } from "../domain/LibClearing.sol";
import { LibABAF } from "../domain/LibABAF.sol";
import { LibERC1410 } from "../domain/LibERC1410.sol";
import { LibSnapshots } from "../domain/LibSnapshots.sol";
import { LibERC1594 } from "../domain/LibERC1594.sol";
import { LibERC20 } from "../domain/LibERC20.sol";
import { LibNonce } from "../../lib/core/LibNonce.sol";
import { LibProtectedPartitions } from "../../lib/core/LibProtectedPartitions.sol";
import { LibResolverProxy } from "../../infrastructure/proxy/LibResolverProxy.sol";
import { Hold } from "../../facets/features/interfaces/hold/IHold.sol";
import { LibHoldOps } from "./LibHoldOps.sol";
import { LibCompliance } from "../core/LibCompliance.sol";

library LibClearingOps {
    using LibLowLevelCall for address;
    using EnumerableSet for EnumerableSet.UintSet;

    error WrongExpirationTimestamp();

    // ============================================================================
    // PUBLIC FUNCTIONS - Clearing Operation Creation
    // ============================================================================

    function operateClearingCreation(
        IClearing.ClearingOperation memory _clearingOperation,
        address _from,
        uint256 _amount,
        IClearing.ClearingOperationType _operationType
    ) internal returns (uint256 clearingId_) {
        bytes32 partition = _clearingOperation.partition;
        clearingId_ = LibClearing.getAndIncrementNextClearingId(_from, partition, _operationType);
        beforeClearingOperation(
            buildClearingOperationIdentifier(_from, partition, clearingId_, _operationType),
            address(0)
        );
        LibERC1410.reduceBalanceByPartition(_from, _amount, partition);
        LibClearing.increaseClearedAmounts(_from, partition, _amount);
    }

    function clearingTransferCreation(
        IClearing.ClearingOperation memory _clearingOperation,
        uint256 _amount,
        address _to,
        address _from,
        bytes memory _operatorData,
        ThirdPartyType _thirdPartyType
    ) internal returns (bool success_, uint256 clearingId_) {
        bytes memory data = _clearingOperation.data;
        uint256 expirationTimestamp = _clearingOperation.expirationTimestamp;
        clearingId_ = operateClearingCreation(
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
                expirationTimestamp: expirationTimestamp,
                destination: _to,
                data: data,
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
            expirationTimestamp,
            data,
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
    ) internal returns (bool success_, uint256 clearingId_) {
        clearingId_ = operateClearingCreation(
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

    function clearingHoldCreationCreation(
        IClearing.ClearingOperation memory _clearingOperation,
        address _from,
        Hold calldata _hold,
        bytes memory _operatorData,
        ThirdPartyType _thirdPartyType
    ) internal returns (bool success_, uint256 clearingId_) {
        clearingId_ = operateClearingCreation(
            _clearingOperation,
            _from,
            _hold.amount,
            IClearing.ClearingOperationType.HoldCreation
        );
        bytes32 partition = _clearingOperation.partition;
        LibClearing.setClearingHoldCreationDataStruct(
            _from,
            partition,
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

    // ============================================================================
    // PUBLIC FUNCTIONS - Clearing Operation Actions
    // ============================================================================

    function approveClearingOperationByPartition(
        IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier
    ) internal returns (bool success_, bytes memory operationData_, bytes32 partition_) {
        return
            _handleClearingOperationByPartition(
                _clearingOperationIdentifier,
                IClearingActions.ClearingActionType.Approve
            );
    }

    function cancelClearingOperationByPartition(
        IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier
    ) internal returns (bool success_) {
        (success_, , ) = _handleClearingOperationByPartition(
            _clearingOperationIdentifier,
            IClearingActions.ClearingActionType.Cancel
        );
    }

    function reclaimClearingOperationByPartition(
        IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier
    ) internal returns (bool success_) {
        (success_, , ) = _handleClearingOperationByPartition(
            _clearingOperationIdentifier,
            IClearingActions.ClearingActionType.Reclaim
        );
    }

    // ============================================================================
    // PUBLIC FUNCTIONS - Protected Clearing Operations
    // ============================================================================

    function protectedClearingTransferByPartition(
        IClearing.ProtectedClearingOperation calldata _protectedClearingOperation,
        uint256 _amount,
        address _to,
        bytes calldata _signature,
        uint256 _blockTimestamp
    ) internal returns (bool success_, uint256 clearingId_) {
        checkNounceAndDeadline(
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
        bytes calldata _signature,
        uint256 _blockTimestamp
    ) internal returns (bool success_, uint256 clearingId_) {
        checkNounceAndDeadline(
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
        (success_, clearingId_) = clearingRedeemCreation(
            _protectedClearingOperation.clearingOperation,
            _amount,
            _protectedClearingOperation.from,
            "",
            ThirdPartyType.PROTECTED
        );
    }

    function protectedClearingCreateHoldByPartition(
        IClearing.ProtectedClearingOperation memory _protectedClearingOperation,
        Hold calldata _hold,
        bytes calldata _signature,
        uint256 _blockTimestamp
    ) internal returns (bool success_, uint256 clearingId_) {
        checkNounceAndDeadline(
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
        (success_, clearingId_) = clearingHoldCreationCreation(
            _protectedClearingOperation.clearingOperation,
            _protectedClearingOperation.from,
            _hold,
            "",
            ThirdPartyType.PROTECTED
        );
    }

    // ============================================================================
    // PUBLIC FUNCTIONS - Allowance Management
    // ============================================================================

    function decreaseAllowedBalanceForClearing(
        bytes32 _partition,
        uint256 _clearingId,
        IClearing.ClearingOperationType _clearingOperationType,
        address _from,
        uint256 _amount
    ) internal {
        address spender = msg.sender;
        LibERC20.spendAllowance(_from, spender, _amount);
        LibClearing.setClearingThirdParty(_partition, _clearingId, _clearingOperationType, _from, spender);
    }

    // ============================================================================
    // PUBLIC FUNCTIONS - Clearing Balance Management
    // ============================================================================

    function beforeClearingOperation(
        IClearing.ClearingOperationIdentifier memory _clearingOperationIdentifier,
        address _to
    ) internal {
        adjustClearingBalances(_clearingOperationIdentifier, _to);
        LibSnapshots.updateAccountSnapshot(
            _clearingOperationIdentifier.tokenHolder,
            _clearingOperationIdentifier.partition
        );
        LibSnapshots.updateAccountSnapshot(_to, _clearingOperationIdentifier.partition);
        LibSnapshots.updateAccountClearedBalancesSnapshot(
            _clearingOperationIdentifier.tokenHolder,
            _clearingOperationIdentifier.partition
        );
    }

    function adjustClearingBalances(
        IClearing.ClearingOperationIdentifier memory _clearingOperationIdentifier,
        address _to
    ) internal {
        LibABAF.triggerAndSyncAll(
            _clearingOperationIdentifier.partition,
            _clearingOperationIdentifier.tokenHolder,
            _to
        );
        uint256 abaf = updateTotalCleared(
            _clearingOperationIdentifier.partition,
            _clearingOperationIdentifier.tokenHolder
        );
        updateClearing(_clearingOperationIdentifier, abaf);
    }

    function updateTotalCleared(bytes32 _partition, address _tokenHolder) internal returns (uint256 abaf_) {
        abaf_ = LibABAF.getAbaf();
        uint256 labaf = LibABAF.getTotalClearedLabaf(_tokenHolder);
        uint256 labafByPartition = LibABAF.getTotalClearedLabafByPartition(_partition, _tokenHolder);
        if (abaf_ != labaf) {
            LibClearing.updateTotalClearedAmountByAccount(_tokenHolder, LibABAF.calculateFactor(abaf_, labaf));
            LibABAF.setTotalClearedLabaf(_tokenHolder, abaf_);
        }
        if (abaf_ != labafByPartition) {
            LibClearing.updateTotalClearedAmountByAccountAndPartition(_tokenHolder, _partition, LibABAF.calculateFactor(abaf_, labafByPartition));
            LibABAF.setTotalClearedLabafByPartition(_partition, _tokenHolder, abaf_);
        }
    }

    function updateClearing(
        IClearing.ClearingOperationIdentifier memory _clearingOperationIdentifier,
        uint256 _abaf
    ) internal {
        uint256 clearingLabaf = LibABAF.getClearingLabafById(_clearingOperationIdentifier);
        if (_abaf == clearingLabaf) return;
        LibClearing.updateClearingAmount(_clearingOperationIdentifier, LibABAF.calculateFactor(_abaf, clearingLabaf));
        LibABAF.setClearedLabafById(_clearingOperationIdentifier, _abaf);
    }

    function transferClearingBalance(bytes32 _partition, address _to, uint256 _amount) internal {
        if (LibERC1410.validPartitionForReceiver(_partition, _to)) {
            LibERC1410.increaseBalanceByPartition(_to, _amount, _partition);
            return;
        }
        LibERC1410.addPartitionTo(_amount, _to, _partition);
    }

    function removeClearing(IClearing.ClearingOperationIdentifier memory _clearingOperationIdentifier) internal {
        uint256 amount = _getClearingAmount(_clearingOperationIdentifier);
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

    // ============================================================================
    // PUBLIC FUNCTIONS - ABAF-Adjusted Read Functions
    // ============================================================================

    function getClearedAmountForAdjustedAt(address _tokenHolder, uint256 _timestamp) internal view returns (uint256) {
        return
            LibClearing.getClearedAmount(_tokenHolder) *
            LibABAF.calculateFactorForClearedAmountAdjustedAt(_tokenHolder, _timestamp);
    }

    function getClearedAmountForByPartitionAdjustedAt(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _timestamp
    ) internal view returns (uint256) {
        uint256 factor = LibABAF.calculateFactor(
            LibABAF.getAbafAdjustedAt(_timestamp),
            LibABAF.getTotalClearedLabafByPartition(_partition, _tokenHolder)
        );
        return LibClearing.getClearedAmountByPartition(_partition, _tokenHolder) * factor;
    }

    function getClearingTransferForByPartitionAdjustedAt(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId,
        uint256 _timestamp
    ) internal view returns (IClearingTransfer.ClearingTransferData memory clearingTransferData_) {
        clearingTransferData_ = LibClearing.getClearingTransferData(_partition, _tokenHolder, _clearingId);
        clearingTransferData_.amount *= LibABAF.calculateFactor(
            LibABAF.getAbafAdjustedAt(_timestamp),
            LibABAF.getClearingLabafById(
                buildClearingOperationIdentifier(
                    _tokenHolder,
                    _partition,
                    _clearingId,
                    IClearing.ClearingOperationType.Transfer
                )
            )
        );
    }

    function getClearingRedeemForByPartitionAdjustedAt(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId,
        uint256 _timestamp
    ) internal view returns (IClearingRedeem.ClearingRedeemData memory clearingRedeemData_) {
        clearingRedeemData_ = LibClearing.getClearingRedeemData(_partition, _tokenHolder, _clearingId);
        clearingRedeemData_.amount *= LibABAF.calculateFactor(
            LibABAF.getAbafAdjustedAt(_timestamp),
            LibABAF.getClearingLabafById(
                buildClearingOperationIdentifier(
                    _tokenHolder,
                    _partition,
                    _clearingId,
                    IClearing.ClearingOperationType.Redeem
                )
            )
        );
    }

    function getClearingHoldCreationForByPartitionAdjustedAt(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _clearingId,
        uint256 _timestamp
    ) internal view returns (IClearingHoldCreation.ClearingHoldCreationData memory clearingHoldCreationData_) {
        clearingHoldCreationData_ = LibClearing.getClearingHoldCreationData(_partition, _tokenHolder, _clearingId);
        clearingHoldCreationData_.amount *= LibABAF.calculateFactor(
            LibABAF.getAbafAdjustedAt(_timestamp),
            LibABAF.getClearingLabafById(
                buildClearingOperationIdentifier(
                    _tokenHolder,
                    _partition,
                    _clearingId,
                    IClearing.ClearingOperationType.HoldCreation
                )
            )
        );
    }

    // ============================================================================
    // PUBLIC FUNCTIONS - Timestamp Validation
    // ============================================================================

    function checkExpirationTimestamp(
        IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier,
        bool _mustBeExpired,
        uint256 _blockTimestamp
    ) internal view {
        (uint256 expirationTimestamp, , ) = LibClearing.getClearingBasicInfo(_clearingOperationIdentifier);
        if ((_blockTimestamp > expirationTimestamp) != _mustBeExpired) {
            if (_mustBeExpired) revert IClearing.ExpirationDateNotReached();
            revert IClearing.ExpirationDateReached();
        }
    }

    function checkValidExpirationTimestamp(uint256 _expirationTimestamp, uint256 _blockTimestamp) internal pure {
        if (_expirationTimestamp < _blockTimestamp) revert WrongExpirationTimestamp();
    }

    function buildClearingOperationIdentifier(
        address _from,
        bytes32 _partition,
        uint256 _clearingId,
        IClearing.ClearingOperationType _operationType
    ) internal pure returns (IClearing.ClearingOperationIdentifier memory) {
        return
            IClearing.ClearingOperationIdentifier({
                tokenHolder: _from,
                partition: _partition,
                clearingId: _clearingId,
                clearingOperationType: _operationType
            });
    }

    // ============================================================================
    // PRIVATE FUNCTIONS - Clearing Operation Handling
    // ============================================================================

    function _handleClearingOperationByPartition(
        IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier,
        IClearingActions.ClearingActionType operationType
    ) private returns (bool success_, bytes memory operationData_, bytes32 partition_) {
        IClearing.ClearingOperationIdentifier memory id = buildClearingOperationIdentifier(
            _clearingOperationIdentifier.tokenHolder,
            _clearingOperationIdentifier.partition,
            _clearingOperationIdentifier.clearingId,
            _clearingOperationIdentifier.clearingOperationType
        );
        address destination = _getClearingDestination(id);
        beforeClearingOperation(id, destination);
        uint256 amount;
        ThirdPartyType operatorType;
        (success_, amount, operatorType, operationData_, partition_) = _operateClearingAction(
            _clearingOperationIdentifier,
            operationType
        );
        _restoreAllowanceAndRemoveClearing(operationType, operatorType, _clearingOperationIdentifier, amount);
    }

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
        transferClearingBalance(_partition, destination, ctd.amount);
        if (
            _tokenHolder != destination && address(LibCompliance.getCompliance()) != address(0) && _partition == _DEFAULT_PARTITION
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
            transferClearingBalance(_partition, _tokenHolder, crd.amount);
        }
        success_ = true;
        amount_ = crd.amount;
        operatorType_ = crd.operatorType;
    }

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
        transferClearingBalance(_partition, _tokenHolder, chcd.amount);
        if (_operation == IClearingActions.ClearingActionType.Approve) {
            Hold memory hold = Hold(
                chcd.amount,
                chcd.holdExpirationTimestamp,
                chcd.holdEscrow,
                chcd.holdTo,
                chcd.holdData
            );
            uint256 holdId;
            (, holdId) = LibHoldOps.createHoldByPartition(
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

    function _restoreAllowanceAndRemoveClearing(
        IClearingActions.ClearingActionType _operation,
        ThirdPartyType _operatorType,
        IClearing.ClearingOperationIdentifier calldata _clearingOperationIdentifier,
        uint256 _amount
    ) private {
        _restoreClearingAllowance(_operation, _operatorType, _clearingOperationIdentifier, _amount);
        removeClearing(
            buildClearingOperationIdentifier(
                _clearingOperationIdentifier.tokenHolder,
                _clearingOperationIdentifier.partition,
                _clearingOperationIdentifier.clearingId,
                _clearingOperationIdentifier.clearingOperationType
            )
        );
    }

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

    // ============================================================================
    // PRIVATE FUNCTIONS - Event Emission
    // ============================================================================

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
        Hold calldata _hold,
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

    // ============================================================================
    // PRIVATE FUNCTIONS - Helper Functions
    // ============================================================================

    function _getClearingAmount(IClearing.ClearingOperationIdentifier memory id) private view returns (uint256) {
        (, uint256 amount_, ) = LibClearing.getClearingBasicInfo(id);
        return amount_;
    }

    function _getClearingDestination(IClearing.ClearingOperationIdentifier memory id) private view returns (address) {
        (, , address destination_) = LibClearing.getClearingBasicInfo(id);
        return destination_;
    }
}
