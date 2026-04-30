// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ClearingStorageWrapper } from "../asset/ClearingStorageWrapper.sol";
import { AdjustBalancesStorageWrapper } from "../asset/AdjustBalancesStorageWrapper.sol";
import { TokenCoreOps } from "./TokenCoreOps.sol";
import { ERC1410StorageWrapper } from "../asset/ERC1410StorageWrapper.sol";
import { SnapshotsStorageWrapper } from "../asset/SnapshotsStorageWrapper.sol";
import { IERC1410Types } from "../../facets/layer_1/ERC1400/ERC1410/IERC1410Types.sol";
import { ITransfer } from "../../facets/transfer/ITransfer.sol";
import { ERC3643StorageWrapper } from "../core/ERC3643StorageWrapper.sol";
import { IClearingTypes } from "../../facets/layer_1/clearing/IClearingTypes.sol";
import {
    IOperatorClearingHoldByPartition
} from "../../facets/layer_1/clearing/operatorClearingHoldByPartition/IOperatorClearingHoldByPartition.sol";
import { ICompliance } from "../../facets/layer_1/ERC3643/ICompliance.sol";
import { IERC3643Types } from "../../facets/layer_1/ERC3643/IERC3643Types.sol";
import { IHoldTypes } from "../../facets/layer_1/hold/IHoldTypes.sol";
import { ThirdPartyType } from "../asset/types/ThirdPartyType.sol";
import { HoldOps } from "./HoldOps.sol";
import { LowLevelCall } from "../../infrastructure/utils/LowLevelCall.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { _DEFAULT_PARTITION } from "../../constants/values.sol";

/**
 * @title ClearingOps - Orchestrator for clearing state-changing operations
 * @notice Library that implements the core clearing lifecycle: creation of
 * deferred transfers, redeems, and hold creations; execution of approvals,
 * cancellations, and reclaims; and management of cleared balances with
 * ABAF (Accumulative Balance Adjustment Factor) synchronisation.
 * @dev Deployed once as a separate contract. Facets call via DELEGATECALL.
 * All functions mutate state through StorageWrappers and emit clearing-
 * specific events. Cleared funds are held in a separate balance ledger
 * until the clearing operation is resolved. ABAF adjustments are applied
 * atomically before any operation execution to ensure balance integrity.
 * @author Asset Tokenization Studio Team
 */
library ClearingOps {
    using LowLevelCall for address;

    /**
     * @notice Creates a clearing operation for a deferred transfer
     * @dev Reduces the holder's available balance by `_amount`, records the
     * cleared amount, and stores the transfer metadata. Emits a
     * third-party-type-specific cleared transfer event. Reverts if the
     * holder does not have sufficient balance or if the partition is
     * invalid. Preconditions: `_from` must hold at least `_amount` tokens
     * in the given partition. Postconditions: balance is reduced, cleared
     * amount is increased, clearing ID is incremented.
     * @param _clearingOperation Clearing operation parameters (partition,
     * expirationTimestamp, data)
     * @param _amount Amount of tokens to place in clearing
     * @param _to Intended recipient of the transfer once approved
     * @param _from Token holder initiating the clearing
     * @param _operatorData Additional data from the operator
     * @param _thirdPartyType Role of the caller (NULL, AUTHORISED, OPERATOR,
     * PROTECTED)
     * @return success_ Always true if no revert
     * @return clearingId_ Assigned clearing identifier
     */
    function clearingTransferCreation(
        IClearingTypes.ClearingOperation memory _clearingOperation,
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
            IClearingTypes.ClearingOperationType.Transfer
        );

        beforeClearingOperation(
            ClearingStorageWrapper.buildClearingOperationIdentifier(
                _from,
                partition,
                clearingId_,
                IClearingTypes.ClearingOperationType.Transfer
            ),
            address(0)
        );

        TokenCoreOps.reduceBalanceByPartition(_from, _amount, partition);
        ClearingStorageWrapper.increaseClearedAmounts(_from, partition, _amount);

        emit ITransfer.Transfer(_from, address(0), _amount);

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

    /**
     * @notice Creates a clearing operation for a deferred redeem
     * @dev Reduces the holder's available balance by `_amount`, records the
     * cleared amount, and stores the redeem metadata. Emits a third-party-
     * type-specific cleared redeem event. Reverts if the holder does not
     * have sufficient balance. Preconditions: `_from` must hold at least
     * `_amount` tokens in the partition. Postconditions: balance reduced,
     * clearing ID incremented, cleared amounts increased.
     * @param _clearingOperation Clearing operation parameters (partition,
     * expirationTimestamp, data)
     * @param _amount Amount of tokens to place in clearing for redemption
     * @param _from Token holder initiating the clearing
     * @param _operatorData Additional data from the operator
     * @param _thirdPartyType Role of the caller
     * @return success_ Always true if no revert
     * @return clearingId_ Assigned clearing identifier
     */
    function clearingRedeemCreation(
        IClearingTypes.ClearingOperation memory _clearingOperation,
        uint256 _amount,
        address _from,
        bytes memory _operatorData,
        ThirdPartyType _thirdPartyType
    ) public returns (bool success_, uint256 clearingId_) {
        bytes32 partition = _clearingOperation.partition;

        clearingId_ = ClearingStorageWrapper.increaseClearingId(
            _from,
            partition,
            IClearingTypes.ClearingOperationType.Redeem
        );

        beforeClearingOperation(
            ClearingStorageWrapper.buildClearingOperationIdentifier(
                _from,
                partition,
                clearingId_,
                IClearingTypes.ClearingOperationType.Redeem
            ),
            address(0)
        );

        TokenCoreOps.reduceBalanceByPartition(_from, _amount, partition);
        ClearingStorageWrapper.increaseClearedAmounts(_from, partition, _amount);

        emit ITransfer.Transfer(_from, address(0), _amount);

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

    /**
     * @notice Creates a clearing operation for a deferred hold creation
     * @dev Reduces the holder's available balance by the hold amount,
     * records the cleared amount, and stores the hold metadata. Emits a
     * third-party-type-specific cleared hold event. Postconditions: balance
     * reduced, clearing ID incremented, cleared amounts increased.
     * @param _clearingOperation Clearing operation parameters (partition,
     * expirationTimestamp, data)
     * @param _from Token holder initiating the clearing
     * @param _hold Hold parameters (amount, expiration, escrow, to, data)
     * @param _operatorData Additional data from the operator
     * @param _thirdPartyType Role of the caller
     * @return success_ Always true if no revert
     * @return clearingId_ Assigned clearing identifier
     */
    function clearingHoldCreationCreation(
        IClearingTypes.ClearingOperation memory _clearingOperation,
        address _from,
        IHoldTypes.Hold calldata _hold,
        bytes memory _operatorData,
        ThirdPartyType _thirdPartyType
    ) public returns (bool success_, uint256 clearingId_) {
        bytes32 partition = _clearingOperation.partition;

        clearingId_ = ClearingStorageWrapper.increaseClearingId(
            _from,
            partition,
            IClearingTypes.ClearingOperationType.HoldCreation
        );

        beforeClearingOperation(
            ClearingStorageWrapper.buildClearingOperationIdentifier(
                _from,
                partition,
                clearingId_,
                IClearingTypes.ClearingOperationType.HoldCreation
            ),
            address(0)
        );

        TokenCoreOps.reduceBalanceByPartition(_from, _hold.amount, partition);
        ClearingStorageWrapper.increaseClearedAmounts(_from, partition, _hold.amount);

        emit ITransfer.Transfer(_from, address(0), _hold.amount);

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

    // CLEARING ACTIONS (approve / cancel / reclaim)

    /**
     * @notice Approves a clearing operation, executing the deferred action
     * @dev For transfers: tokens are moved to the destination. For redeems:
     * tokens are burned (verified identity/compliance). For hold creations:
     * the hold is created and the balance returned to the holder. Emits
     * appropriate events. Only the token holder or an authorised party can
     * approve. Postconditions: clearing operation is removed; if not
     * approve, allowance is restored.
     * @param _clearingOperationIdentifier Identifier of the clearing operation
     * @return success_ True if operation succeeded
     * @return operationData_ Encoded hold ID for hold creation operations
     * @return partition_ Partition of the operation
     */
    function approveClearingOperationByPartition(
        IClearingTypes.ClearingOperationIdentifier calldata _clearingOperationIdentifier
    ) public returns (bool success_, bytes memory operationData_, bytes32 partition_) {
        return
            handleClearingOperationByPartition(_clearingOperationIdentifier, IClearingTypes.ClearingActionType.Approve);
    }

    /**
     * @notice Cancels a clearing operation, returning funds to the holder
     * @dev The cleared amount is transferred back to the holder and the
     * clearing record is removed. The allowance (if any) is restored.
     * Emits appropriate events. Only the token holder or an authorised
     * party can cancel. Postconditions: balance restored, clearing removed.
     * @param _clearingOperationIdentifier Identifier of the clearing operation
     * @return success_ True if operation succeeded
     */
    function cancelClearingOperationByPartition(
        IClearingTypes.ClearingOperationIdentifier calldata _clearingOperationIdentifier
    ) public returns (bool success_) {
        (success_, , ) = handleClearingOperationByPartition(
            _clearingOperationIdentifier,
            IClearingTypes.ClearingActionType.Cancel
        );
    }

    /**
     * @notice Reclaims a clearing operation, returning funds to the holder
     * @dev Identical in effect to cancellation: the cleared amount is
     * transferred back and the clearing record is removed. Allowance is
     * restored. Reclaim is typically used when the operation has expired
     * or the holder reclaims. Postconditions: balance restored, clearing
     * removed.
     * @param _clearingOperationIdentifier Identifier of the clearing operation
     * @return success_ True if operation succeeded
     */
    function reclaimClearingOperationByPartition(
        IClearingTypes.ClearingOperationIdentifier calldata _clearingOperationIdentifier
    ) public returns (bool success_) {
        (success_, , ) = handleClearingOperationByPartition(
            _clearingOperationIdentifier,
            IClearingTypes.ClearingActionType.Reclaim
        );
    }

    /**
     * @notice Decreases the caller's allowance and records the third party
     * for a clearing operation
     * @dev Used when an operator or authorised party initiates a clearing
     * via allowance. The spender's allowance is decreased by `_amount`
     * and the third party is stored for later restoration if the clearing
     * is cancelled or reclaimed. Preconditions: the caller must have an
     * allowance of at least `_amount` for `_from`. Postconditions:
     * allowance reduced, third party set.
     * @param _partition Partition of the clearing operation
     * @param _clearingId Clearing operation identifier
     * @param _clearingOperationType Type of clearing operation
     * @param _from Token holder
     * @param _amount Amount deducted from allowance
     */
    function decreaseAllowedBalanceForClearing(
        bytes32 _partition,
        uint256 _clearingId,
        IClearingTypes.ClearingOperationType _clearingOperationType,
        address _from,
        uint256 _amount
    ) public {
        address spender = EvmAccessors.getMsgSender();
        TokenCoreOps.decreaseAllowedBalance(_from, spender, _amount);
        ClearingStorageWrapper.setClearingThirdParty(_partition, _from, _clearingOperationType, _clearingId, spender);
    }

    // ============================================================================
    // INTERNAL: OPERATION DISPATCH
    // ============================================================================

    /**
     * @notice Dispatches a clearing operation to the appropriate execution
     * handler based on operation type
     * @dev Applies beforeClearingOperation (ABAF sync), then routes to
     * the specific execution function. If the action is not Approve, the
     * allowance is restored and the clearing record is removed after
     * execution.
     * @param _clearingOperationIdentifier Identifier of the clearing operation
     * @param _operationType Approve, Cancel, or Reclaim
     * @return success_ True if operation succeeded
     * @return operationData_ Encoded hold ID for hold creation approvals
     * @return partition_ Partition of the operation
     */
    function handleClearingOperationByPartition(
        IClearingTypes.ClearingOperationIdentifier calldata _clearingOperationIdentifier,
        IClearingTypes.ClearingActionType _operationType
    ) internal returns (bool success_, bytes memory operationData_, bytes32 partition_) {
        partition_ = _clearingOperationIdentifier.partition;

        // Call beforeClearingOperation to apply ABAF adjustments (like reference's _beforeClearingOperation)
        beforeClearingOperation(
            _clearingOperationIdentifier,
            resolveDestination(_clearingOperationIdentifier, _operationType)
        );

        if (_clearingOperationIdentifier.clearingOperationType == IClearingTypes.ClearingOperationType.Transfer) {
            clearingTransferExecution(_clearingOperationIdentifier, _operationType);
        } else if (_clearingOperationIdentifier.clearingOperationType == IClearingTypes.ClearingOperationType.Redeem) {
            clearingRedeemExecution(_clearingOperationIdentifier, _operationType);
        } else {
            operationData_ = clearingHoldCreationExecution(_clearingOperationIdentifier, _operationType);
        }

        success_ = true;

        // Restore allowance and remove clearing (like reference's _restoreAllowanceAndRemoveClearing)
        if (_operationType != IClearingTypes.ClearingActionType.Approve) {
            restoreAllowanceAndRemoveClearing(_clearingOperationIdentifier);
        } else {
            ClearingStorageWrapper.removeClearing(_clearingOperationIdentifier);
        }
    }

    /**
     * @notice Executes a clearing transfer operation (approve, cancel, or reclaim)
     * @dev On approve: moves the cleared amount to the original destination.
     * On cancel/reclaim: moves the cleared amount back to the token holder.
     * For approve to a different address, identity and compliance checks
     * are performed and the compliance module is notified if applicable.
     * @param _id Clearing operation identifier
     * @param _actionType Approve, Cancel, or Reclaim
     */
    function clearingTransferExecution(
        IClearingTypes.ClearingOperationIdentifier calldata _id,
        IClearingTypes.ClearingActionType _actionType
    ) internal {
        IClearingTypes.ClearingTransferData memory transferData = ClearingStorageWrapper
            .getClearingTransferForByPartition(_id.partition, _id.tokenHolder, _id.clearingId);

        // Cancel/Reclaim: transfer back to holder, no compliance checks
        if (_actionType != IClearingTypes.ClearingActionType.Approve) {
            transferClearingBalance(_id.partition, _id.tokenHolder, transferData.amount);
            return;
        }

        // Approve: transfer to original destination
        transferClearingBalance(_id.partition, transferData.destination, transferData.amount);

        // No identity/compliance check needed when holder is the destination
        if (_id.tokenHolder == transferData.destination) return;

        // Verify identity and compliance for transfers to different addresses
        TokenCoreOps.checkIdentity(_id.tokenHolder, transferData.destination);
        TokenCoreOps.checkCompliance(_id.tokenHolder, transferData.destination, false);

        // Notify compliance module (same pattern as HoldStorageWrapper and ERC1410StorageWrapper)
        if (_id.partition == _DEFAULT_PARTITION && ERC3643StorageWrapper.erc3643Storage().compliance != address(0)) {
            (ERC3643StorageWrapper.erc3643Storage().compliance).functionCall(
                abi.encodeWithSelector(
                    ICompliance.transferred.selector,
                    _id.tokenHolder,
                    transferData.destination,
                    transferData.amount
                ),
                IERC3643Types.ComplianceCallFailed.selector
            );
        }
    }

    /**
     * @notice Executes a clearing redeem operation (approve, cancel, or reclaim)
     * @dev On cancel/reclaim: moves the cleared amount back to the token
     * holder. On approve: checks identity and compliance for burn
     * (destination address(0)) but does not actually burn; the balance
     * was already reduced at creation time and the tokens are effectively
     * burned when the clearing is approved. No additional token transfer
     * occurs.
     * @param _id Clearing operation identifier
     * @param _actionType Approve, Cancel, or Reclaim
     */
    function clearingRedeemExecution(
        IClearingTypes.ClearingOperationIdentifier calldata _id,
        IClearingTypes.ClearingActionType _actionType
    ) internal {
        // Cancel/Reclaim: restore ABAF-adjusted amount to holder
        if (_actionType != IClearingTypes.ClearingActionType.Approve) {
            IClearingTypes.ClearingRedeemData memory redeemData = ClearingStorageWrapper
                .getClearingRedeemForByPartition(_id.partition, _id.tokenHolder, _id.clearingId);
            transferClearingBalance(_id.partition, _id.tokenHolder, redeemData.amount);
            return;
        }

        // Approve: _verify identity/compliance (tokens are burned, no transfer back)
        TokenCoreOps.checkIdentity(_id.tokenHolder, address(0));
        TokenCoreOps.checkCompliance(_id.tokenHolder, address(0), false);
    }

    /**
     * @notice Executes a clearing hold creation operation (approve, cancel, or reclaim)
     * @dev For all actions, the cleared amount is first returned to the
     * holder. On approve, a hold is then created using HoldOps and the
     * hold ID is returned. On cancel/reclaim, only the balance is
     * restored and the hold is not created.
     * @param _id Clearing operation identifier
     * @param _actionType Approve, Cancel, or Reclaim
     * @return operationData_ Encoded hold ID if action is Approve, empty
     * otherwise
     */
    function clearingHoldCreationExecution(
        IClearingTypes.ClearingOperationIdentifier calldata _id,
        IClearingTypes.ClearingActionType _actionType
    ) internal returns (bytes memory operationData_) {
        IClearingTypes.ClearingHoldCreationData memory holdData = ClearingStorageWrapper
            .getClearingHoldCreationForByPartition(_id.partition, _id.tokenHolder, _id.clearingId);

        // Always restore ABAF-adjusted amount to holder
        transferClearingBalance(_id.partition, _id.tokenHolder, holdData.amount);

        // Approve: create hold and return holdId
        if (_actionType == IClearingTypes.ClearingActionType.Approve) {
            IHoldTypes.Hold memory hold = IHoldTypes.Hold({
                amount: holdData.amount,
                expirationTimestamp: holdData.holdExpirationTimestamp,
                escrow: holdData.holdEscrow,
                to: holdData.holdTo,
                data: holdData.holdData
            });

            (, uint256 holdId) = HoldOps.createHoldByPartition(
                _id.partition,
                _id.tokenHolder,
                hold,
                holdData.operatorData,
                holdData.operatorType
            );
            operationData_ = abi.encode(holdId);
        }
    }

    // ============================================================================
    // INTERNAL: BALANCE ADJUSTMENTS
    // ============================================================================

    /**
     * @notice Transfers cleared balance to a destination address within a
     * partition
     * @dev Delegates to the internal variant `transferClearingBalanceInternal`.
     * If the destination already holds the partition, the balance is
     * increased; otherwise, the partition is added to the destination.
     * Emits TransferByPartition and Transfer events.
     * @param _partition Partition identifier
     * @param _to Destination address receiving the cleared balance
     * @param _amount Amount to transfer
     */
    function transferClearingBalance(bytes32 _partition, address _to, uint256 _amount) internal {
        // Delegate to internal helper with direct StorageWrapper access
        transferClearingBalanceInternal(_partition, _to, _amount);
    }

    /**
     * @notice Internal variant of transferClearingBalance with direct
     * StorageWrapper access
     * @dev Checks whether the receiver already has the partition using
     * ERC1410StorageWrapper.validPartitionForReceiver. If yes, increases
     * balance; otherwise, adds the partition to the receiver's portfolio.
     * Emits TransferByPartition and Transfer events in both cases.
     * @param _partition Partition identifier
     * @param _to Destination address
     * @param _amount Amount to transfer
     */
    function transferClearingBalanceInternal(bytes32 _partition, address _to, uint256 _amount) internal {
        if (ERC1410StorageWrapper.validPartitionForReceiver(_partition, _to)) {
            ERC1410StorageWrapper.increaseBalanceByPartition(_to, _amount, _partition);
            emit IERC1410Types.TransferByPartition(
                _partition,
                EvmAccessors.getMsgSender(),
                address(0),
                _to,
                _amount,
                "",
                ""
            );
            emit ITransfer.Transfer(address(0), _to, _amount);
        } else {
            ERC1410StorageWrapper.addPartitionTo(_amount, _to, _partition);
            emit IERC1410Types.TransferByPartition(
                _partition,
                EvmAccessors.getMsgSender(),
                address(0),
                _to,
                _amount,
                "",
                ""
            );
            emit ITransfer.Transfer(address(0), _to, _amount);
        }
    }

    /**
     * @notice Hook executed before any clearing operation to synchronise
     * ABAF adjustments
     * @dev Delegates to the batched variant `beforeClearingOperationBatched`
     * to reduce delegatecall overhead. This function triggers ERC1410
     * partition sync, updates account and cleared balance snapshots, and
     * applies ABAF adjustments to total cleared amounts and individual
     * clearing amounts if the ABAF factor has changed.
     * @param _id Clearing operation identifier
     * @param _destination Destination address for the operation (may be
     * address(0) for redeems)
     */
    function beforeClearingOperation(
        IClearingTypes.ClearingOperationIdentifier memory _id,
        address _destination
    ) internal {
        // Delegate to batched internal function to reduce delegatecall overhead
        beforeClearingOperationBatched(_id, _destination);
    }

    /**
     * @notice Batched version of beforeClearingOperation to reduce
     * delegatecall overhead
     * @dev Directly calls ERC1410StorageWrapper.triggerAndSyncAll,
     * SnapshotsStorageWrapper for account and cleared balances snapshots,
     * and applies ABAF adjustments. Three ABAF checks are performed:
     * total cleared balance (all partitions), total cleared balance by
     * partition, and individual clearing amount. Each stores the updated
     * ABAF value for future comparisons. The order of adjustments must
     * occur before execution reads the clearing amount.
     * @param _id Clearing operation identifier
     * @param _destination Destination address for the operation
     */
    function beforeClearingOperationBatched(
        IClearingTypes.ClearingOperationIdentifier memory _id,
        address _destination
    ) internal {
        // Direct calls — no delegatecall overhead
        ERC1410StorageWrapper.triggerAndSyncAll(_id.partition, _id.tokenHolder, _destination);
        SnapshotsStorageWrapper.updateAccountSnapshot(_id.tokenHolder, _id.partition);
        SnapshotsStorageWrapper.updateAccountSnapshot(_destination, _id.partition);
        SnapshotsStorageWrapper.updateAccountClearedBalancesSnapshot(_id.tokenHolder, _id.partition);

        // ABAF adjustments: update cleared amounts and LABAF if factors have changed
        uint256 abaf = AdjustBalancesStorageWrapper.getAbaf();
        uint256 totalLabaf = AdjustBalancesStorageWrapper.getTotalClearedLabaf(_id.tokenHolder);
        uint256 totalLabafByPartition = AdjustBalancesStorageWrapper.getTotalClearedLabafByPartition(
            _id.partition,
            _id.tokenHolder
        );

        if (abaf != totalLabaf) {
            uint256 factor = AdjustBalancesStorageWrapper.calculateFactor(abaf, totalLabaf);
            ClearingStorageWrapper.multiplyTotalClearedAmount(_id.tokenHolder, factor);
            AdjustBalancesStorageWrapper.setTotalClearedLabaf(_id.tokenHolder, abaf);
        }

        if (abaf != totalLabafByPartition) {
            uint256 factorByPartition = AdjustBalancesStorageWrapper.calculateFactor(abaf, totalLabafByPartition);
            ClearingStorageWrapper.multiplyTotalClearedAmountByPartition(
                _id.tokenHolder,
                _id.partition,
                factorByPartition
            );
            AdjustBalancesStorageWrapper.setTotalClearedLabafByPartition(_id.partition, _id.tokenHolder, abaf);
        }

        // Update individual clearing amount (must happen BEFORE execution reads it)
        uint256 clearingLabaf = AdjustBalancesStorageWrapper.getClearingLabafById(_id);
        if (abaf != clearingLabaf) {
            uint256 clearingFactor = AdjustBalancesStorageWrapper.calculateFactor(abaf, clearingLabaf);
            ClearingStorageWrapper.updateClearingAmountById(_id, clearingFactor);
            AdjustBalancesStorageWrapper.setClearedLabafById(_id, abaf);
        }
    }

    /**
     * @notice Restores the allowance and removes a clearing operation
     * @dev Reads the original amount from the clearing record, calls
     * restoreClearingAllowance to increase the spender's allowance, and
     * then removes the clearing record. Only called for cancel/reclaim
     * operations (not approve).
     * @param _id Clearing operation identifier
     * @return amount_ The cleared amount that was restored
     */
    function restoreAllowanceAndRemoveClearing(
        IClearingTypes.ClearingOperationIdentifier calldata _id
    ) internal returns (uint256 amount_) {
        amount_ = ClearingStorageWrapper.isClearingBasicInfo(_id).amount;
        restoreClearingAllowance(_id, amount_);
        ClearingStorageWrapper.removeClearing(_id);
    }

    /**
     * @notice Restores the allowance for a cancelled/reclaimed clearing
     * operation if it was initiated by an operator or authorised party
     * @dev Checks the third party type stored for the clearing. If the
     * operator type is AUTHORISED or OPERATOR, the spender's allowance
     * is increased by the cleared amount.
     * @param _id Clearing operation identifier
     * @param _amount Amount to restore to allowance
     */
    function restoreClearingAllowance(
        IClearingTypes.ClearingOperationIdentifier calldata _id,
        uint256 _amount
    ) internal {
        ThirdPartyType operatorType = ClearingStorageWrapper.getClearingThirdPartyType(_id);
        if (operatorType == ThirdPartyType.AUTHORIZED || operatorType == ThirdPartyType.OPERATOR) {
            address spender = ClearingStorageWrapper.getClearingThirdParty(
                _id.partition,
                _id.tokenHolder,
                _id.clearingOperationType,
                _id.clearingId
            );
            TokenCoreOps.increaseAllowedBalance(_id.tokenHolder, spender, _amount);
        }
    }

    /**
     * @notice Emits a cleared transfer event appropriate to the third party
     * type
     * @dev Dispatches to one of four event variants:
     * ClearedTransferByPartition (NULL),
     * ClearedTransferFromByPartition (AUTHORISED),
     * ClearedOperatorTransferByPartition (OPERATOR),
     * ProtectedClearedTransferByPartition (PROTECTED).
     * @param _from Token holder
     * @param _to Intended recipient
     * @param _partition Partition
     * @param _clearingId Clearing ID
     * @param _amount Cleared amount
     * @param _expirationTimestamp Expiration timestamp of the operation
     * @param _data Operation data
     * @param _operatorData Operator data
     * @param _thirdPartyType Role of the caller
     */
    function emitClearedTransferEvent(
        address _from,
        address _to,
        bytes32 _partition,
        uint256 _clearingId,
        uint256 _amount,
        uint256 _expirationTimestamp,
        bytes memory _data,
        bytes memory _operatorData,
        ThirdPartyType _thirdPartyType
    ) internal {
        if (_thirdPartyType == ThirdPartyType.NULL) {
            emit IClearingTypes.ClearedTransferByPartition(
                EvmAccessors.getMsgSender(),
                _from,
                _to,
                _partition,
                _clearingId,
                _amount,
                _expirationTimestamp,
                _data,
                _operatorData
            );
            return;
        }
        if (_thirdPartyType == ThirdPartyType.AUTHORIZED) {
            emit IClearingTypes.ClearedTransferFromByPartition(
                EvmAccessors.getMsgSender(),
                _from,
                _to,
                _partition,
                _clearingId,
                _amount,
                _expirationTimestamp,
                _data,
                _operatorData
            );
            return;
        }
        if (_thirdPartyType == ThirdPartyType.OPERATOR) {
            emit IClearingTypes.ClearedOperatorTransferByPartition(
                EvmAccessors.getMsgSender(),
                _from,
                _to,
                _partition,
                _clearingId,
                _amount,
                _expirationTimestamp,
                _data,
                _operatorData
            );
            return;
        }
        emit IClearingTypes.ProtectedClearedTransferByPartition(
            EvmAccessors.getMsgSender(),
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

    /**
     * @notice Emits a cleared redeem event appropriate to the third party
     * type
     * @dev Dispatches to one of four event variants:
     * ClearedRedeemByPartition (NULL),
     * ClearedRedeemFromByPartition (AUTHORISED),
     * ClearedOperatorRedeemByPartition (OPERATOR),
     * ProtectedClearedRedeemByPartition (PROTECTED).
     * @param _from Token holder
     * @param _partition Partition
     * @param _clearingId Clearing ID
     * @param _amount Cleared amount
     * @param _expirationTimestamp Expiration timestamp
     * @param _data Operation data
     * @param _operatorData Operator data
     * @param _thirdPartyType Role of the caller
     */
    function emitClearedRedeemEvent(
        address _from,
        bytes32 _partition,
        uint256 _clearingId,
        uint256 _amount,
        uint256 _expirationTimestamp,
        bytes memory _data,
        bytes memory _operatorData,
        ThirdPartyType _thirdPartyType
    ) internal {
        if (_thirdPartyType == ThirdPartyType.NULL) {
            emit IClearingTypes.ClearedRedeemByPartition(
                EvmAccessors.getMsgSender(),
                _from,
                _partition,
                _clearingId,
                _amount,
                _expirationTimestamp,
                _data,
                _operatorData
            );
            return;
        }
        if (_thirdPartyType == ThirdPartyType.AUTHORIZED) {
            emit IClearingTypes.ClearedRedeemFromByPartition(
                EvmAccessors.getMsgSender(),
                _from,
                _partition,
                _clearingId,
                _amount,
                _expirationTimestamp,
                _data,
                _operatorData
            );
            return;
        }
        if (_thirdPartyType == ThirdPartyType.OPERATOR) {
            emit IClearingTypes.ClearedOperatorRedeemByPartition(
                EvmAccessors.getMsgSender(),
                _from,
                _partition,
                _clearingId,
                _amount,
                _expirationTimestamp,
                _data,
                _operatorData
            );
            return;
        }
        emit IClearingTypes.ProtectedClearedRedeemByPartition(
            EvmAccessors.getMsgSender(),
            _from,
            _partition,
            _clearingId,
            _amount,
            _expirationTimestamp,
            _data,
            _operatorData
        );
    }

    /**
     * @notice Emits a cleared hold event appropriate to the third party type
     * @dev Dispatches to one of four event variants:
     * ClearedHoldByPartition (NULL),
     * ClearedHoldFromByPartition (AUTHORISED),
     * ClearedOperatorHoldByPartition (OPERATOR),
     * ProtectedClearedHoldByPartition (PROTECTED).
     * @param _from Token holder
     * @param _partition Partition
     * @param _clearingId Clearing ID
     * @param _hold Hold details (amount, expiration, escrow, to, data)
     * @param _expirationTimestamp Clearing operation expiration
     * @param _data Operation data
     * @param _operatorData Operator data
     * @param _thirdPartyType Role of the caller
     */
    function emitClearedHoldByPartitionEvent(
        address _from,
        bytes32 _partition,
        uint256 _clearingId,
        IHoldTypes.Hold calldata _hold,
        uint256 _expirationTimestamp,
        bytes memory _data,
        bytes memory _operatorData,
        ThirdPartyType _thirdPartyType
    ) internal {
        if (_thirdPartyType == ThirdPartyType.NULL) {
            emit IClearingTypes.ClearedHoldByPartition(
                EvmAccessors.getMsgSender(),
                _from,
                _partition,
                _clearingId,
                _hold,
                _expirationTimestamp,
                _data,
                _operatorData
            );
            return;
        }
        if (_thirdPartyType == ThirdPartyType.AUTHORIZED) {
            emit IClearingTypes.ClearedHoldFromByPartition(
                EvmAccessors.getMsgSender(),
                _from,
                _partition,
                _clearingId,
                _hold,
                _expirationTimestamp,
                _data,
                _operatorData
            );
            return;
        }
        if (_thirdPartyType == ThirdPartyType.OPERATOR) {
            emit IOperatorClearingHoldByPartition.ClearedOperatorHoldByPartition(
                EvmAccessors.getMsgSender(),
                _from,
                _partition,
                _clearingId,
                _hold,
                _expirationTimestamp,
                _data,
                _operatorData
            );
            return;
        }
        emit IClearingTypes.ProtectedClearedHoldByPartition(
            EvmAccessors.getMsgSender(),
            _from,
            _partition,
            _clearingId,
            _hold,
            _expirationTimestamp,
            _data,
            _operatorData
        );
    }

    // ============================================================================
    // INTERNAL VIEW
    // ============================================================================

    /**
     * @notice Resolves the destination address for a clearing operation
     * based on action type
     * @dev For cancel/reclaim actions, always returns the token holder.
     * For approve: if transfer, returns the stored destination; if redeem,
     * returns address(0); if hold creation, returns the token holder
     * (balance is restored before hold creation).
     * @param _id Clearing operation identifier
     * @param _actionType Approve, Cancel, or Reclaim
     * @return Destination address for the operation (may be address(0))
     */
    function resolveDestination(
        IClearingTypes.ClearingOperationIdentifier calldata _id,
        IClearingTypes.ClearingActionType _actionType
    ) internal view returns (address) {
        // Cancel/Reclaim always restore to holder — no storage read needed
        if (_actionType != IClearingTypes.ClearingActionType.Approve) {
            return _id.tokenHolder;
        }

        // Approve paths
        if (_id.clearingOperationType == IClearingTypes.ClearingOperationType.Transfer) {
            return
                ClearingStorageWrapper
                    .getClearingTransferForByPartition(_id.partition, _id.tokenHolder, _id.clearingId)
                    .destination;
        }
        if (_id.clearingOperationType == IClearingTypes.ClearingOperationType.Redeem) {
            return address(0);
        }

        // HoldCreation: restore to holder, then execution creates hold from balance
        return _id.tokenHolder;
    }
}
