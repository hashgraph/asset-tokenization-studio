// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ClearingStorageWrapper } from "../asset/ClearingStorageWrapper.sol";
import { AdjustBalancesStorageWrapper } from "../asset/AdjustBalancesStorageWrapper.sol";
import { TokenCoreOps } from "./TokenCoreOps.sol";
import { ERC1410StorageWrapper } from "../asset/ERC1410StorageWrapper.sol";
import { SnapshotsStorageWrapper } from "../asset/SnapshotsStorageWrapper.sol";
import { IERC1410Types } from "../../facets/layer_1/ERC1400/ERC1410/IERC1410Types.sol";
import { IERC20 } from "../../facets/layer_1/ERC1400/ERC20/IERC20.sol";
import { ERC3643StorageWrapper } from "../core/ERC3643StorageWrapper.sol";
import { IClearingTypes } from "../../facets/layer_1/clearing/IClearingTypes.sol";
import { ICompliance } from "../../facets/layer_1/ERC3643/ICompliance.sol";
import { IERC3643Types } from "../../facets/layer_1/ERC3643/IERC3643Types.sol";
import { IHoldTypes } from "../../facets/layer_1/hold/IHoldTypes.sol";
import { ThirdPartyType } from "../asset/types/ThirdPartyType.sol";
import { HoldOps } from "./HoldOps.sol";
import { LowLevelCall } from "../../infrastructure/utils/LowLevelCall.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { _DEFAULT_PARTITION } from "../../constants/values.sol";

/**
 * @title Clearing Operations Library
 * @notice Orchestrates state-changing operations for token clearing, including creation,
 *         approval, cancellation, and reclamation of cleared transfers, redeems, and holds.
 * @dev Intended for use via DELEGATECALL from facets. Delegates token operations to TokenCoreOps
 *      and manages clearing data through ClearingStorageWrapper. Emits events via IClearingTypes.
 */
library ClearingOps {
    using LowLevelCall for address;

    /**
     * @notice Creates a new clearing record for a token transfer.
     * @dev Generates a unique clearing identifier and applies pre-clearing adjustments.
     *      Reduces the sender's partition balance and increases their cleared amount.
     *      Stores transfer-specific data and emits the appropriate clearing event.
     * @param _clearingOperation The partition, expiration, and metadata for the clearing.
     * @param _amount The quantity of tokens to clear.
     * @param _to The intended recipient of the transfer.
     * @param _from The token holder initiating the clearing.
     * @param _operatorData Additional data provided by the operator.
     * @param _thirdPartyType Classification of the initiating party.
     * @return success_ True if the clearing creation succeeds.
     * @return clearingId_ The unique identifier assigned to this clearing operation.
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
     * @notice Creates a new clearing record for a token redemption.
     * @dev Generates a unique clearing identifier and applies pre-clearing adjustments.
     *      Reduces the sender's partition balance and increases their cleared amount.
     *      Stores redeem-specific data and emits the appropriate clearing event.
     * @param _clearingOperation The partition, expiration, and metadata for the clearing.
     * @param _amount The quantity of tokens to clear.
     * @param _from The token holder initiating the clearing.
     * @param _operatorData Additional data provided by the operator.
     * @param _thirdPartyType Classification of the initiating party.
     * @return success_ True if the clearing creation succeeds.
     * @return clearingId_ The unique identifier assigned to this clearing operation.
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
     * @notice Creates a new clearing record for a hold creation.
     * @dev Generates a unique clearing identifier and applies pre-clearing adjustments.
     *      Reduces the sender's partition balance and increases their cleared amount.
     *      Stores hold creation data and emits the appropriate clearing event.
     * @param _clearingOperation The partition, expiration, and metadata for the clearing.
     * @param _from The token holder initiating the clearing.
     * @param _hold The hold parameters including amount, expiration, escrow, and destination.
     * @param _operatorData Additional data provided by the operator.
     * @param _thirdPartyType Classification of the initiating party.
     * @return success_ True if the clearing creation succeeds.
     * @return clearingId_ The unique identifier assigned to this clearing operation.
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
     * @notice Approves a previously created clearing operation, executing its underlying action.
     * @dev Delegates to {handleClearingOperationByPartition} with the Approve action type.
     * @param _clearingOperationIdentifier The unique identifier of the clearing to approve.
     * @return success_ True if the approval and execution succeed.
     * @return operationData_ Encoded data returned by the execution (e.g., a hold ID).
     * @return partition_ The partition affected by the clearing.
     */
    function approveClearingOperationByPartition(
        IClearingTypes.ClearingOperationIdentifier calldata _clearingOperationIdentifier
    ) public returns (bool success_, bytes memory operationData_, bytes32 partition_) {
        return
            handleClearingOperationByPartition(_clearingOperationIdentifier, IClearingTypes.ClearingActionType.Approve);
    }

    /**
     * @notice Cancels a clearing operation, restoring the held balance to the token holder.
     * @dev Delegates to {handleClearingOperationByPartition} with the Cancel action type.
     * @param _clearingOperationIdentifier The unique identifier of the clearing to cancel.
     * @return success_ True if the cancellation succeeds.
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
     * @notice Reclaims a clearing operation, restoring the held balance to the token holder.
     * @dev Delegates to {handleClearingOperationByPartition} with the Reclaim action type.
     * @param _clearingOperationIdentifier The unique identifier of the clearing to reclaim.
     * @return success_ True if the reclamation succeeds.
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
     * @notice Decreases the allowed balance for a clearing operation and records the spender.
     * @dev Retrieves the message sender as the spender and updates the clearing third-party record.
     * @param _partition The partition of the tokens.
     * @param _clearingId The identifier of the clearing operation.
     * @param _clearingOperationType The type of the clearing operation.
     * @param _from The token holder whose allowance is being decreased.
     * @param _amount The quantity by which to decrease the allowance.
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

    /**
     * @notice Handles the execution of a clearing operation based on the specified action type.
     * @dev Applies pre-clearing adjustments, routes to the appropriate execution logic
     *      (transfer, redeem, or hold creation), and cleans up allowances or removes the clearing.
     *      Restores allowances for Cancel and Reclaim actions; removes the clearing for Approve.
     * @param _clearingOperationIdentifier The unique identifier of the clearing.
     * @param _operationType The action to perform: Approve, Cancel, or Reclaim.
     * @return success_ True if the operation completes successfully.
     * @return operationData_ Encoded data returned by the execution (e.g., a hold ID).
     * @return partition_ The partition affected by the clearing.
     */
    function handleClearingOperationByPartition(
        IClearingTypes.ClearingOperationIdentifier calldata _clearingOperationIdentifier,
        IClearingTypes.ClearingActionType _operationType
    ) internal returns (bool success_, bytes memory operationData_, bytes32 partition_) {
        partition_ = _clearingOperationIdentifier.partition;
        // Call beforeClearingOperation to apply ABAF adjustments
        beforeClearingOperation(
            _clearingOperationIdentifier,
            _resolveDestination(_clearingOperationIdentifier, _operationType)
        );
        if (_clearingOperationIdentifier.clearingOperationType == IClearingTypes.ClearingOperationType.Transfer) {
            clearingTransferExecution(_clearingOperationIdentifier, _operationType);
        } else if (_clearingOperationIdentifier.clearingOperationType == IClearingTypes.ClearingOperationType.Redeem) {
            clearingRedeemExecution(_clearingOperationIdentifier, _operationType);
        } else {
            operationData_ = clearingHoldCreationExecution(_clearingOperationIdentifier, _operationType);
        }
        success_ = true;
        // Restore allowance and remove clearing
        if (_operationType != IClearingTypes.ClearingActionType.Approve) {
            restoreAllowanceAndRemoveClearing(_clearingOperationIdentifier);
        } else {
            ClearingStorageWrapper.removeClearing(_clearingOperationIdentifier);
        }
    }

    /**
     * @notice Executes a cleared transfer based on the specified action type.
     * @dev For Cancel or Reclaim, restores the cleared balance to the token holder.
     *      For Approve, transfers to the original destination and verifies identity and compliance
     *      when the destination differs from the holder. Notifies the compliance module for
     *      default partition transfers.
     * @param _id The identifier of the clearing operation.
     * @param _actionType The action to perform.
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
        // Notify compliance module
        address compliance = ERC3643StorageWrapper.getCompliance();
        if (_id.partition == _DEFAULT_PARTITION && compliance != address(0)) {
            compliance.functionCall(
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
     * @notice Executes a cleared redeem based on the specified action type.
     * @dev For Cancel or Reclaim, restores the cleared balance to the token holder.
     *      For Approve, verifies identity and compliance; tokens are burned with no transfer back.
     * @param _id The identifier of the clearing operation.
     * @param _actionType The action to perform.
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
        // Approve: verify identity/compliance (tokens are burned, no transfer back)
        TokenCoreOps.checkIdentity(_id.tokenHolder, address(0));
        TokenCoreOps.checkCompliance(_id.tokenHolder, address(0), false);
    }

    /**
     * @notice Executes a cleared hold creation based on the specified action type.
     * @dev Always restores the cleared balance to the token holder.
     *      For Approve, creates a hold via HoldOps and returns the encoded hold ID.
     * @param _id The identifier of the clearing operation.
     * @param _actionType The action to perform.
     * @return operationData_ Encoded hold identifier if approved; otherwise empty.
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
     * @notice Transfers a cleared balance to a specified address within a partition.
     * @dev Delegates to the internal helper that directly manipulates storage.
     * @param _partition The partition to transfer from.
     * @param _to The destination address.
     * @param _amount The quantity of tokens to transfer.
     */
    function transferClearingBalance(bytes32 _partition, address _to, uint256 _amount) internal {
        // Delegate to internal helper with direct StorageWrapper access
        _transferClearingBalanceInternal(_partition, _to, _amount);
    }

    /**
     * @notice Internal helper that performs the balance transfer for cleared amounts.
     * @dev Increases the recipient's balance or adds a new partition if invalid for the receiver.
     *      Emits {TransferByPartition} and {Transfer} events.
     * @param _partition The partition to transfer.
     * @param _to The destination address.
     * @param _amount The quantity of tokens to transfer.
     */
    function _transferClearingBalanceInternal(bytes32 _partition, address _to, uint256 _amount) internal {
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
            emit IERC20.Transfer(address(0), _to, _amount);
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
            emit IERC20.Transfer(address(0), _to, _amount);
        }
    }

    /**
     * @notice Applies pre-clearing adjustments and synchronisation for a clearing operation.
     * @dev Delegates to the batched internal variant to reduce delegatecall overhead.
     * @param _id The identifier of the clearing operation.
     * @param _destination The intended destination address for the clearing.
     */
    function beforeClearingOperation(
        IClearingTypes.ClearingOperationIdentifier memory _id,
        address _destination
    ) internal {
        // Delegate to batched internal function to reduce delegatecall overhead
        _beforeClearingOperationBatched(_id, _destination);
    }

    /**
     * @notice Batched pre-clearing routine that updates snapshots and applies ABAF adjustments.
     * @dev Synchronises account balances, updates cleared balance snapshots, and adjusts
     *      total and per-partition cleared amounts using ABAF factors. Also updates the
     *      individual clearing amount if its LABAF differs from the current ABAF.
     *      Must execute before the clearing operation reads its final amount.
     * @param _id The identifier of the clearing operation.
     * @param _destination The intended destination address.
     */
    function _beforeClearingOperationBatched(
        IClearingTypes.ClearingOperationIdentifier memory _id,
        address _destination
    ) internal {
        // Direct calls - no delegatecall overhead
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
     * @notice Restores any spent allowance and removes the clearing record.
     * @dev Retrieves the cleared amount from basic info, restores the allowance, and deletes
     *      the clearing data from storage.
     * @param _id The identifier of the clearing operation.
     * @return amount_ The quantity of tokens that were cleared.
     */
    function restoreAllowanceAndRemoveClearing(
        IClearingTypes.ClearingOperationIdentifier calldata _id
    ) internal returns (uint256 amount_) {
        amount_ = ClearingStorageWrapper.isClearingBasicInfo(_id).amount;
        restoreClearingAllowance(_id, amount_);
        ClearingStorageWrapper.removeClearing(_id);
    }

    /**
     * @notice Restores the token allowance for authorised or operator-initiated clearings.
     * @dev Only adjusts the allowance for AUTHORIZED or OPERATOR third-party types.
     * @param _id The identifier of the clearing operation.
     * @param _amount The quantity of tokens to restore to the allowance.
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
     * @notice Emits the appropriate cleared transfer event based on third-party type.
     * @dev Routes to {ClearedTransferByPartition}, {ClearedTransferFromByPartition},
     *      {ClearedOperatorTransferByPartition}, or {ProtectedClearedTransferByPartition}.
     * @param _from The token holder address.
     * @param _to The intended recipient.
     * @param _partition The token partition.
     * @param _clearingId The clearing identifier.
     * @param _amount The quantity of tokens.
     * @param _expirationTimestamp The expiration time of the clearing.
     * @param _data Arbitrary data attached to the clearing.
     * @param _operatorData Data provided by the operator.
     * @param _thirdPartyType The classification of the initiating party.
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
     * @notice Emits the appropriate cleared redeem event based on third-party type.
     * @dev Routes to {ClearedRedeemByPartition}, {ClearedRedeemFromByPartition},
     *      {ClearedOperatorRedeemByPartition}, or {ProtectedClearedRedeemByPartition}.
     * @param _from The token holder address.
     * @param _partition The token partition.
     * @param _clearingId The clearing identifier.
     * @param _amount The quantity of tokens.
     * @param _expirationTimestamp The expiration time of the clearing.
     * @param _data Arbitrary data attached to the clearing.
     * @param _operatorData Data provided by the operator.
     * @param _thirdPartyType The classification of the initiating party.
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
     * @notice Emits the appropriate cleared hold event based on third-party type.
     * @dev Routes to {ClearedHoldByPartition}, {ClearedHoldFromByPartition},
     *      {ClearedOperatorHoldByPartition}, or {ProtectedClearedHoldByPartition}.
     * @param _from The token holder address.
     * @param _partition The token partition.
     * @param _clearingId The clearing identifier.
     * @param _hold The hold details.
     * @param _expirationTimestamp The expiration time of the clearing.
     * @param _data Arbitrary data attached to the clearing.
     * @param _operatorData Data provided by the operator.
     * @param _thirdPartyType The classification of the initiating party.
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
            emit IClearingTypes.ClearedOperatorHoldByPartition(
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
     * @notice Resolves the destination address for a clearing action.
     * @dev Returns the token holder for Cancel and Reclaim actions.
     *      For Approve, returns the transfer destination, zero address for redeems,
     *      or the token holder for hold creations.
     * @param _id The identifier of the clearing operation.
     * @param _actionType The action being performed.
     * @return The destination address applicable to the action.
     */
    function _resolveDestination(
        IClearingTypes.ClearingOperationIdentifier calldata _id,
        IClearingTypes.ClearingActionType _actionType
    ) internal view returns (address) {
        // Cancel/Reclaim always restore to holder - no storage read needed
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
