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

/// @title ClearingOps - Orchestrator for clearing state-changing operations
/// @notice Deployed once as a separate contract. Facets call via DELEGATECALL.
/// @dev Uses TokenCoreOps for token operations (avoids inlining), ClearingStorageWrapper for clearing data.
library ClearingOps {
    using LowLevelCall for address;

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

    function approveClearingOperationByPartition(
        IClearingTypes.ClearingOperationIdentifier calldata _clearingOperationIdentifier
    ) public returns (bool success_, bytes memory operationData_, bytes32 partition_) {
        return
            handleClearingOperationByPartition(_clearingOperationIdentifier, IClearingTypes.ClearingActionType.Approve);
    }

    function cancelClearingOperationByPartition(
        IClearingTypes.ClearingOperationIdentifier calldata _clearingOperationIdentifier
    ) public returns (bool success_) {
        (success_, , ) = handleClearingOperationByPartition(
            _clearingOperationIdentifier,
            IClearingTypes.ClearingActionType.Cancel
        );
    }

    function reclaimClearingOperationByPartition(
        IClearingTypes.ClearingOperationIdentifier calldata _clearingOperationIdentifier
    ) public returns (bool success_) {
        (success_, , ) = handleClearingOperationByPartition(
            _clearingOperationIdentifier,
            IClearingTypes.ClearingActionType.Reclaim
        );
    }

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

    function transferClearingBalance(bytes32 _partition, address _to, uint256 _amount) internal {
        // Delegate to internal helper with direct StorageWrapper access
        transferClearingBalanceInternal(_partition, _to, _amount);
    }

    /// @dev Internal variant of transferClearingBalance with direct StorageWrapper access
    /// @param _partition Partition to transfer
    /// @param _to Destination address
    /// @param _amount Amount to transfer
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

    function beforeClearingOperation(
        IClearingTypes.ClearingOperationIdentifier memory _id,
        address _destination
    ) internal {
        // Delegate to batched internal function to reduce delegatecall overhead
        beforeClearingOperationBatched(_id, _destination);
    }

    /// @dev Batched version of beforeClearingOperation to reduce delegatecall overhead
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

    function restoreAllowanceAndRemoveClearing(
        IClearingTypes.ClearingOperationIdentifier calldata _id
    ) internal returns (uint256 amount_) {
        amount_ = ClearingStorageWrapper.isClearingBasicInfo(_id).amount;
        restoreClearingAllowance(_id, amount_);
        ClearingStorageWrapper.removeClearing(_id);
    }

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
