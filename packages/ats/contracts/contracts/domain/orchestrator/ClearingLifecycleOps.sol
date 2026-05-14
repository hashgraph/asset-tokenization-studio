// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ClearingOps } from "./ClearingOps.sol";
import { ClearingStorageWrapper } from "../asset/ClearingStorageWrapper.sol";
import { TokenCoreOps } from "./TokenCoreOps.sol";
import { ERC1410StorageWrapper } from "../asset/ERC1410StorageWrapper.sol";
import { ERC20StorageWrapper } from "../asset/ERC20StorageWrapper.sol";
import { SnapshotsStorageWrapper } from "../asset/SnapshotsStorageWrapper.sol";
import { HoldStorageWrapper } from "../asset/HoldStorageWrapper.sol";
import { IERC1410Types } from "../../facets/layer_1/ERC1400/ERC1410/IERC1410Types.sol";
import { ERC3643StorageWrapper } from "../core/ERC3643StorageWrapper.sol";
import { IClearingTypes } from "../../facets/layer_1/clearing/IClearingTypes.sol";
import { ICompliance } from "../../facets/layer_1/ERC3643/ICompliance.sol";
import { IERC3643Types } from "../../facets/layer_1/ERC3643/IERC3643Types.sol";
import { IHoldTypes } from "../../facets/layer_1/hold/IHoldTypes.sol";
import { ThirdPartyType } from "../asset/types/ThirdPartyType.sol";
import { HoldOps } from "./HoldOps.sol";
import { LowLevelCall } from "../../infrastructure/utils/LowLevelCall.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { _checkUnexpectedError } from "../../infrastructure/utils/UnexpectedError.sol";
import { CLEARING_HOLD_CREATION } from "../../constants/values.sol";

/**
 * @title ClearingLifecycleOps - Lifecycle path for cleared deferred operations
 * @notice Library that owns the post-creation phase of the clearing protocol:
 * approve, cancel, reclaim, and the dispatcher that routes each action through
 * the appropriate execution helper (transfer, redeem, hold creation), along
 * with the ABAF-aware balance restoration and allowance restoration helpers.
 * @dev Extracted from `ClearingOps` to keep both libraries below the EIP-170
 * 24 KiB runtime cap. The creation entry points and event emitters stay in
 * `ClearingOps`; this library reuses `ClearingOps.beforeClearingOperation`
 * via an `internal` call, which the compiler inlines so no cross-library link
 * is required at deploy time.
 * @author Asset Tokenization Studio Team
 */
library ClearingLifecycleOps {
    using LowLevelCall for address;

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
    ) external returns (bool success_, bytes memory operationData_, bytes32 partition_) {
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
    ) external returns (bool success_) {
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
    ) external returns (bool success_) {
        (success_, , ) = handleClearingOperationByPartition(
            _clearingOperationIdentifier,
            IClearingTypes.ClearingActionType.Reclaim
        );
    }

    /**
     * @notice Dispatches a clearing operation to the appropriate execution
     * handler based on operation type
     * @dev Applies `ClearingOps.beforeClearingOperation` (ABAF sync) via an
     * internal cross-library call (inlined by the compiler), then routes to
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
    ) private returns (bool success_, bytes memory operationData_, bytes32 partition_) {
        partition_ = _clearingOperationIdentifier.partition;

        // Apply ABAF adjustments via the canonical helper in ClearingOps. The
        // function is `internal` there, so the call is inlined at link time
        // and no library address needs to be supplied.
        ClearingOps.beforeClearingOperation(
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
    ) private {
        IClearingTypes.ClearingTransferData memory transferData = ClearingStorageWrapper
            .getClearingTransferForByPartition(_id.partition, _id.tokenHolder, _id.clearingId);

        // Cancel/Reclaim: transfer back to holder, no compliance checks
        if (_actionType != IClearingTypes.ClearingActionType.Approve) {
            transferClearingBalance(_id.partition, _id.tokenHolder, _id.tokenHolder, transferData.amount);
            return;
        }

        ERC1410StorageWrapper.updateSecurityHolder(_id.tokenHolder, transferData.destination, transferData.amount);

        // Approve: transfer to original destination
        transferClearingBalance(_id.partition, _id.tokenHolder, transferData.destination, transferData.amount);

        // No identity/compliance check needed when holder is the destination
        if (_id.tokenHolder == transferData.destination) return;

        // Verify identity and compliance for transfers to different addresses
        TokenCoreOps.checkIdentity(_id.tokenHolder, transferData.destination);
        TokenCoreOps.checkCompliance(_id.tokenHolder, transferData.destination, false);

        // Notify compliance module for every partition; zero-target short-circuits in LowLevelCall.
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

    /**
     * @notice Executes a clearing redeem operation (approve, cancel, or reclaim)
     * @dev On cancel/reclaim: moves the cleared amount back to the token
     * holder. On approve: verifies identity/compliance and finalises the
     * burn. The holder balance and partition balance were already reduced
     * at creation time, so this path snapshots and reduces totalSupply,
     * notifies the compliance module on the default partition, runs the
     * `afterTokenTransfer` hook so ERC-20 Votes' totalSupply checkpoints and
     * the holder's voting power track the burn, and emits `RedeemedByPartition`.
     * @param _id Clearing operation identifier
     * @param _actionType Approve, Cancel, or Reclaim
     */
    function clearingRedeemExecution(
        IClearingTypes.ClearingOperationIdentifier calldata _id,
        IClearingTypes.ClearingActionType _actionType
    ) private {
        IClearingTypes.ClearingRedeemData memory redeemData = ClearingStorageWrapper.getClearingRedeemForByPartition(
            _id.partition,
            _id.tokenHolder,
            _id.clearingId
        );

        // Cancel/Reclaim: restore ABAF-adjusted amount to holder
        if (_actionType != IClearingTypes.ClearingActionType.Approve) {
            transferClearingBalance(_id.partition, _id.tokenHolder, _id.tokenHolder, redeemData.amount);
            return;
        }

        ERC1410StorageWrapper.updateSecurityHolder(_id.tokenHolder, address(0), redeemData.amount);

        // Approve: verify identity/compliance for the burn destination address(0)
        TokenCoreOps.checkIdentity(_id.tokenHolder, address(0));
        TokenCoreOps.checkCompliance(_id.tokenHolder, address(0), false);

        // Snapshot totalSupply before the burn so historical queries see pre-burn state
        SnapshotsStorageWrapper.updateTotalSupplySnapshot(_id.partition);

        // Finalise the burn: holder balance and partition balance were debited at
        // creation, so only the partition supply and ERC-20 totalSupply remain to drop
        ERC1410StorageWrapper.reduceTotalSupplyByPartition(_id.partition, redeemData.amount);

        // Notify compliance module for every partition; zero-target short-circuits in LowLevelCall.
        (ERC3643StorageWrapper.erc3643Storage().compliance).functionCall(
            abi.encodeWithSelector(ICompliance.destroyed.selector, _id.tokenHolder, redeemData.amount),
            IERC3643Types.ComplianceCallFailed.selector
        );

        // Mirror redeemByPartition: keep ERC-20 Votes' totalSupply checkpoints and the
        // holder's delegated voting power aligned with the now-finalised burn
        ERC1410StorageWrapper.afterTokenTransfer(_id.partition, _id.tokenHolder, address(0), redeemData.amount);

        emit IERC1410Types.RedeemedByPartition(
            _id.partition,
            EvmAccessors.getMsgSender(),
            _id.tokenHolder,
            redeemData.amount,
            redeemData.data,
            redeemData.operatorData
        );
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
    ) private returns (bytes memory operationData_) {
        IClearingTypes.ClearingHoldCreationData memory holdData = ClearingStorageWrapper
            .getClearingHoldCreationForByPartition(_id.partition, _id.tokenHolder, _id.clearingId);

        // Always restore ABAF-adjusted amount to holder
        transferClearingBalance(_id.partition, _id.tokenHolder, _id.tokenHolder, holdData.amount);

        // Approve: create hold and return holdId
        if (_actionType == IClearingTypes.ClearingActionType.Approve) {
            IHoldTypes.Hold memory hold = IHoldTypes.Hold({
                amount: holdData.amount,
                expirationTimestamp: holdData.holdExpirationTimestamp,
                escrow: holdData.holdEscrow,
                to: holdData.holdTo,
                data: holdData.holdData
            });

            (bool success, uint256 holdId) = HoldOps.createHoldByPartition(
                _id.partition,
                _id.tokenHolder,
                hold,
                holdData.operatorData,
                holdData.operatorType
            );

            _checkUnexpectedError(!success, CLEARING_HOLD_CREATION);

            if (holdData.operatorType == ThirdPartyType.AUTHORIZED) {
                address thirdPartyAddress = ClearingStorageWrapper.getClearingThirdParty(
                    _id.partition,
                    _id.tokenHolder,
                    IClearingTypes.ClearingOperationType.HoldCreation,
                    _id.clearingId
                );
                HoldStorageWrapper.setThirdPartyForHold(thirdPartyAddress, _id.partition, _id.tokenHolder, holdId);
            }

            operationData_ = abi.encode(holdId);
        }
    }

    /**
     * @notice Transfers cleared balance to a destination address within a partition
     * @dev If the destination already holds the partition the balance is
     * increased; otherwise the partition is added to the destination.
     * Emits TransferByPartition and an ERC-20 Transfer event in both cases.
     * @param _partition Partition identifier
     * @param _from Original token holder whose cleared balance is being moved
     * @param _to Destination address
     * @param _amount Amount to transfer
     */
    function transferClearingBalance(bytes32 _partition, address _from, address _to, uint256 _amount) private {
        if (ERC1410StorageWrapper.validPartitionForReceiver(_partition, _to)) {
            ERC1410StorageWrapper.increasePartitionOnly(_to, _amount, _partition);
        } else {
            ERC1410StorageWrapper.addPartitionToOnly(_amount, _to, _partition);
        }
        emit IERC1410Types.TransferByPartition(
            _partition,
            EvmAccessors.getMsgSender(),
            address(0),
            _to,
            _amount,
            "",
            ""
        );
        ERC20StorageWrapper.performTransfer(address(0), _to, _amount);
        ERC1410StorageWrapper.afterTokenTransfer(_partition, _from, _to, _amount);
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
    ) private returns (uint256 amount_) {
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
    ) private {
        ThirdPartyType operatorType = ClearingStorageWrapper.getClearingThirdPartyType(_id);
        if (operatorType != ThirdPartyType.AUTHORIZED && operatorType != ThirdPartyType.OPERATOR) return;
        TokenCoreOps.increaseAllowedBalance(
            _id.tokenHolder,
            ClearingStorageWrapper.getClearingThirdParty(
                _id.partition,
                _id.tokenHolder,
                _id.clearingOperationType,
                _id.clearingId
            ),
            _amount
        );
    }

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
    ) private view returns (address) {
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
