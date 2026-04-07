// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ClearingStorageWrapper } from "../asset/ClearingStorageWrapper.sol";
import { AdjustBalancesStorageWrapper } from "../asset/AdjustBalancesStorageWrapper.sol";
import { ERC1594StorageWrapper } from "../asset/ERC1594StorageWrapper.sol";
import { TokenCoreOps } from "./TokenCoreOps.sol";
import { NonceStorageWrapper } from "../core/NonceStorageWrapper.sol";
import { ProtectedPartitionsStorageWrapper } from "../core/ProtectedPartitionsStorageWrapper.sol";
import { ERC3643StorageWrapper } from "../core/ERC3643StorageWrapper.sol";
import { IClearingTypes } from "../../facets/layer_1/clearing/IClearingTypes.sol";
import { IClearingActions } from "../../facets/layer_1/clearing/IClearingActions.sol";
import { IClearingTypes } from "../../facets/layer_1/clearing/IClearingTypes.sol";
import { ICompliance } from "../../facets/layer_1/ERC3643/ICompliance.sol";
import { IERC3643Management } from "../../facets/layer_1/ERC3643/IERC3643Management.sol";
import { IHoldTypes } from "../../facets/layer_1/hold/IHoldTypes.sol";
import { ThirdPartyType } from "../asset/types/ThirdPartyType.sol";
import { HoldOps } from "./HoldOps.sol";
import { _checkNounceAndDeadline } from "../../infrastructure/utils/ERC712.sol";
import { LowLevelCall } from "../../infrastructure/utils/LowLevelCall.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { _DEFAULT_PARTITION } from "../../constants/values.sol";

/// @title ClearingOps - Orchestrator for clearing state-changing operations
/// @notice Deployed once as a separate contract. Facets call via DELEGATECALL.
/// @dev Uses TokenCoreOps for token operations (avoids inlining), ClearingStorageWrapper for clearing data.
library ClearingOps {
    using LowLevelCall for address;

    // ============================================================================
    // CLEARING CREATION OPERATIONS
    // ============================================================================

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

    // ============================================================================
    // CLEARING ACTIONS (approve / cancel / reclaim)
    // ============================================================================

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

    // ============================================================================
    // PROTECTED CLEARING OPERATIONS (EIP-712)
    // ============================================================================

    function protectedClearingTransferByPartition(
        IClearingTypes.ProtectedClearingOperation calldata _protectedClearingOperation,
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

        // Check wallet recovery status for from and to addresses
        ERC1594StorageWrapper.requireNotRecoveredAddresses(_protectedClearingOperation.from, _to);

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
        IClearingTypes.ProtectedClearingOperation calldata _protectedClearingOperation,
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

        // Check wallet recovery status for from address
        ERC1594StorageWrapper.requireNotRecoveredAddresses(_protectedClearingOperation.from, address(0));

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
        IClearingTypes.ProtectedClearingOperation calldata _protectedClearingOperation,
        IHoldTypes.Hold calldata _hold,
        bytes calldata _signature
    ) public returns (bool success_, uint256 clearingId_) {
        _checkNounceAndDeadline(
            _protectedClearingOperation.nonce,
            _protectedClearingOperation.from,
            NonceStorageWrapper.getNonceFor(_protectedClearingOperation.from),
            _protectedClearingOperation.deadline,
            TimeTravelStorageWrapper.getBlockTimestamp()
        );

        // Check wallet recovery status for from and to addresses
        ERC1594StorageWrapper.requireNotRecoveredAddresses(_protectedClearingOperation.from, _hold.to);

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
        IClearingTypes.ClearingOperationType _clearingOperationType,
        address _from,
        uint256 _amount
    ) public {
        address spender = msg.sender;
        TokenCoreOps.decreaseAllowedBalance(_from, spender, _amount);
        ClearingStorageWrapper.setClearingThirdParty(_partition, _from, _clearingOperationType, _clearingId, spender);
    }

    // ============================================================================
    // INTERNAL: CLEARING OPERATION HANDLING
    // ============================================================================

    function handleClearingOperationByPartition(
        IClearingTypes.ClearingOperationIdentifier calldata _clearingOperationIdentifier,
        IClearingTypes.ClearingActionType _operationType
    ) internal returns (bool success_, bytes memory operationData_, bytes32 partition_) {
        partition_ = _clearingOperationIdentifier.partition;

        IClearingTypes.ClearingOperationBasicInfo memory data = ClearingStorageWrapper.isClearingBasicInfo(
            _clearingOperationIdentifier
        );

        // Get destination for beforeClearingOperation (like reference implementation)
        address destination;
        if (_clearingOperationIdentifier.clearingOperationType == IClearingTypes.ClearingOperationType.Transfer) {
            destination = data.destination;
        } else if (_clearingOperationIdentifier.clearingOperationType == IClearingTypes.ClearingOperationType.Redeem) {
            destination = address(0);
        } else {
            // HoldCreation: restore to holder for Cancel/Reclaim, no transfer for Approve
            destination = _clearingOperationIdentifier.tokenHolder;
        }

        // For Cancel/Reclaim, adjust destination to restore to holder
        if (_operationType != IClearingTypes.ClearingActionType.Approve) {
            destination = _clearingOperationIdentifier.tokenHolder;
        }

        // Call beforeClearingOperation to apply ABAF adjustments (like reference's _beforeClearingOperation)
        beforeClearingOperation(_clearingOperationIdentifier, destination);

        // Initialize operationData_ as empty (only HoldCreation fills it)
        bytes memory holdData;

        if (_clearingOperationIdentifier.clearingOperationType == IClearingTypes.ClearingOperationType.Transfer) {
            clearingTransferExecution(_clearingOperationIdentifier, data, _operationType);
            success_ = true;
        } else if (_clearingOperationIdentifier.clearingOperationType == IClearingTypes.ClearingOperationType.Redeem) {
            clearingRedeemExecution(_clearingOperationIdentifier, data, _operationType);
            success_ = true;
        } else {
            holdData = clearingHoldCreationExecution(_clearingOperationIdentifier, data, _operationType);
            if (holdData.length > 0) {
                operationData_ = holdData;
            }
            success_ = true;
        }

        // Restore allowance and remove clearing (like reference's _restoreAllowanceAndRemoveClearing)
        if (_operationType != IClearingTypes.ClearingActionType.Approve) {
            restoreAllowanceAndRemoveClearing(_clearingOperationIdentifier);
        } else {
            ClearingStorageWrapper.removeClearing(_clearingOperationIdentifier);
        }
    }

    function clearingTransferExecution(
        IClearingTypes.ClearingOperationIdentifier calldata _clearingOperationIdentifier,
        IClearingTypes.ClearingOperationBasicInfo memory /* data */,
        IClearingTypes.ClearingActionType _operationType
    ) internal {
        // Get the ABAF-adjusted amount from storage (already updated by beforeClearingOperation)
        IClearingTypes.ClearingTransferData memory transferData = ClearingStorageWrapper
            .getClearingTransferForByPartition(
                _clearingOperationIdentifier.partition,
                _clearingOperationIdentifier.tokenHolder,
                _clearingOperationIdentifier.clearingId
            );

        // Determine destination: original for Approve, holder for Cancel/Reclaim
        address destination;
        if (_operationType == IClearingTypes.ClearingActionType.Approve) {
            destination = transferData.destination;
        } else {
            destination = _clearingOperationIdentifier.tokenHolder;
        }

        // Transfer the ABAF-adjusted amount
        transferClearingBalance(_clearingOperationIdentifier.partition, destination, transferData.amount);

        // Only check identity/compliance for Approve operations with different destination
        if (
            _operationType == IClearingTypes.ClearingActionType.Approve &&
            _clearingOperationIdentifier.tokenHolder != destination
        ) {
            TokenCoreOps.checkIdentity(_clearingOperationIdentifier.tokenHolder, destination);
            TokenCoreOps.checkCompliance(_clearingOperationIdentifier.tokenHolder, destination, false);

            // Notify compliance module of the transfer (same pattern as HoldStorageWrapper and ERC1410StorageWrapper)
            if (
                _clearingOperationIdentifier.partition == _DEFAULT_PARTITION &&
                ERC3643StorageWrapper.erc3643Storage().compliance != address(0)
            ) {
                (ERC3643StorageWrapper.erc3643Storage().compliance).functionCall(
                    abi.encodeWithSelector(
                        ICompliance.transferred.selector,
                        _clearingOperationIdentifier.tokenHolder,
                        destination,
                        transferData.amount
                    ),
                    IERC3643Management.ComplianceCallFailed.selector
                );
            }
        }
    }

    function clearingRedeemExecution(
        IClearingTypes.ClearingOperationIdentifier calldata _clearingOperationIdentifier,
        IClearingTypes.ClearingOperationBasicInfo memory /* data */,
        IClearingTypes.ClearingActionType _operationType
    ) internal {
        // Get the ABAF-adjusted amount from storage (already updated by beforeClearingOperation)
        IClearingTypes.ClearingRedeemData memory redeemData = ClearingStorageWrapper.getClearingRedeemForByPartition(
            _clearingOperationIdentifier.partition,
            _clearingOperationIdentifier.tokenHolder,
            _clearingOperationIdentifier.clearingId
        );

        // For Approve: nothing to transfer (tokens are burned)
        // For Cancel/Reclaim: restore ABAF-adjusted amount to holder
        if (_operationType != IClearingTypes.ClearingActionType.Approve) {
            transferClearingBalance(
                _clearingOperationIdentifier.partition,
                _clearingOperationIdentifier.tokenHolder,
                redeemData.amount
            );
        }

        // Only check identity/compliance for Approve operations
        if (_operationType == IClearingTypes.ClearingActionType.Approve) {
            TokenCoreOps.checkIdentity(_clearingOperationIdentifier.tokenHolder, address(0));
            TokenCoreOps.checkCompliance(_clearingOperationIdentifier.tokenHolder, address(0), false);
        }
    }

    function clearingHoldCreationExecution(
        IClearingTypes.ClearingOperationIdentifier calldata _clearingOperationIdentifier,
        IClearingTypes.ClearingOperationBasicInfo memory /* data */,
        IClearingTypes.ClearingActionType _operationType
    ) internal returns (bytes memory operationData_) {
        // Get the ABAF-adjusted amount from storage (already updated by beforeClearingOperation)
        IClearingTypes.ClearingHoldCreationData memory holdCreationData = ClearingStorageWrapper
            .getClearingHoldCreationForByPartition(
                _clearingOperationIdentifier.partition,
                _clearingOperationIdentifier.tokenHolder,
                _clearingOperationIdentifier.clearingId
            );

        // For HoldCreation: ALWAYS restore balance to holder
        // For Approve: restore ABAF-adjusted amount (after clearing amount update)
        // For Cancel/Reclaim: restore ABAF-adjusted amount to holder
        address destination = _clearingOperationIdentifier.tokenHolder;

        // Transfer the ABAF-adjusted amount to holder
        transferClearingBalance(_clearingOperationIdentifier.partition, destination, holdCreationData.amount);

        // For Approve: create hold from holder's balance with ABAF-adjusted amount
        // Return operationData_ (holdId) only for Approve operations
        if (_operationType == IClearingTypes.ClearingActionType.Approve) {
            IHoldTypes.Hold memory hold = IHoldTypes.Hold({
                amount: holdCreationData.amount,
                expirationTimestamp: holdCreationData.holdExpirationTimestamp,
                escrow: holdCreationData.holdEscrow,
                to: holdCreationData.holdTo,
                data: holdCreationData.holdData
            });

            (, uint256 holdId) = HoldOps.createHoldByPartition(
                _clearingOperationIdentifier.partition,
                _clearingOperationIdentifier.tokenHolder,
                hold,
                holdCreationData.operatorData,
                holdCreationData.operatorType
            );

            operationData_ = abi.encode(holdId);
        }
        // removeClearing is now handled in handleClearingOperationByPartition
    }

    // ============================================================================
    // INTERNAL: BALANCE ADJUSTMENTS
    // ============================================================================

    function adjustClearingBalances(
        IClearingTypes.ClearingOperationIdentifier calldata _clearingOperationIdentifier,
        address _to,
        uint256 _amount
    ) internal {
        bytes32 partition = _clearingOperationIdentifier.partition;
        address _from = _clearingOperationIdentifier.tokenHolder;

        // Update total cleared amounts with factor (like reference implementation)
        uint256 abaf = AdjustBalancesStorageWrapper.getAbaf();
        uint256 totalLabaf = AdjustBalancesStorageWrapper.getTotalClearedLabaf(_from);
        uint256 totalLabafByPartition = AdjustBalancesStorageWrapper.getTotalClearedLabafByPartition(partition, _from);
        uint256 clearingLabaf = AdjustBalancesStorageWrapper.getClearingLabafById(_clearingOperationIdentifier);

        // Multiply total cleared amount by factor if ABAF != total LABAF
        if (abaf != totalLabaf) {
            uint256 factor = AdjustBalancesStorageWrapper.calculateFactor(abaf, totalLabaf);
            ClearingStorageWrapper.multiplyTotalClearedAmount(_from, factor);
            AdjustBalancesStorageWrapper.setTotalClearedLabaf(_from, abaf);
        }

        // Multiply total cleared amount by partition by factor if needed
        if (abaf != totalLabafByPartition) {
            uint256 factorByPartition = AdjustBalancesStorageWrapper.calculateFactor(abaf, totalLabafByPartition);
            ClearingStorageWrapper.multiplyTotalClearedAmountByPartition(_from, partition, factorByPartition);
            AdjustBalancesStorageWrapper.setTotalClearedLabafByPartition(partition, _from, abaf);
        }

        // Update clearing-specific amount if needed
        if (abaf != clearingLabaf) {
            uint256 clearingFactor = AdjustBalancesStorageWrapper.calculateFactor(abaf, clearingLabaf);
            ClearingStorageWrapper.updateClearingAmountById(_clearingOperationIdentifier, clearingFactor);
            AdjustBalancesStorageWrapper.setClearedLabafById(_clearingOperationIdentifier, abaf);
        }

        if (_to != address(0)) {
            transferClearingBalance(partition, _to, _amount);
        }
    }

    function transferClearingBalance(bytes32 _partition, address _to, uint256 _amount) internal {
        if (TokenCoreOps.validPartitionForReceiver(_partition, _to)) {
            TokenCoreOps.increaseBalanceByPartition(_to, _amount, _partition);
            TokenCoreOps.emitTransferByPartition(
                _partition,
                EvmAccessors.getMsgSender(),
                address(0),
                _to,
                _amount,
                "",
                ""
            );
            TokenCoreOps.emitTransfer(address(0), _to, _amount);
        } else {
            TokenCoreOps.addPartitionTo(_amount, _to, _partition);
            TokenCoreOps.emitTransferByPartition(
                _partition,
                EvmAccessors.getMsgSender(),
                address(0),
                _to,
                _amount,
                "",
                ""
            );
            TokenCoreOps.emitTransfer(address(0), _to, _amount);
        }
    }

    // ============================================================================
    // INTERNAL: BEFORE/AFTER OPERATIONS
    // ============================================================================

    function beforeClearingOperation(
        IClearingTypes.ClearingOperationIdentifier memory _clearingOperationIdentifier,
        address _destination
    ) internal {
        // Trigger pending scheduled tasks and sync balance adjustments
        // This applies ABAF factor to existing balances (like reference's _triggerAndSyncAll)
        TokenCoreOps.triggerAndSyncAll(
            _clearingOperationIdentifier.partition,
            _clearingOperationIdentifier.tokenHolder,
            _destination
        );

        TokenCoreOps.updateAccountSnapshot(
            _clearingOperationIdentifier.tokenHolder,
            _clearingOperationIdentifier.partition
        );
        TokenCoreOps.updateAccountSnapshot(_destination, _clearingOperationIdentifier.partition);
        TokenCoreOps.updateAccountClearedBalancesSnapshot(
            _clearingOperationIdentifier.tokenHolder,
            _clearingOperationIdentifier.partition
        );

        uint256 abaf = AdjustBalancesStorageWrapper.getAbaf();

        // For NEW clearings created BEFORE adjustBalances, clearingLabaf will be 0 (converted to 1 by zeroToOne)
        // For NEW clearings created AFTER adjustBalances, we should set clearingLabaf = abaf
        // For EXISTING clearings created BEFORE adjustBalances, we should NOT update them here
        // (they will be updated during EXECUTION in adjustClearingBalances)

        // Update total cleared amount and LABAF if needed (like Reference implementation's _updateTotalCleared)
        uint256 totalLabaf = AdjustBalancesStorageWrapper.getTotalClearedLabaf(
            _clearingOperationIdentifier.tokenHolder
        );
        uint256 totalLabafByPartition = AdjustBalancesStorageWrapper.getTotalClearedLabafByPartition(
            _clearingOperationIdentifier.partition,
            _clearingOperationIdentifier.tokenHolder
        );

        if (abaf != totalLabaf) {
            uint256 factor = AdjustBalancesStorageWrapper.calculateFactor(abaf, totalLabaf);
            ClearingStorageWrapper.multiplyTotalClearedAmount(_clearingOperationIdentifier.tokenHolder, factor);
            AdjustBalancesStorageWrapper.setTotalClearedLabaf(_clearingOperationIdentifier.tokenHolder, abaf);
        }

        if (abaf != totalLabafByPartition) {
            uint256 factorByPartition = AdjustBalancesStorageWrapper.calculateFactor(abaf, totalLabafByPartition);
            ClearingStorageWrapper.multiplyTotalClearedAmountByPartition(
                _clearingOperationIdentifier.tokenHolder,
                _clearingOperationIdentifier.partition,
                factorByPartition
            );
            AdjustBalancesStorageWrapper.setTotalClearedLabafByPartition(
                _clearingOperationIdentifier.partition,
                _clearingOperationIdentifier.tokenHolder,
                abaf
            );
        }

        // Update individual clearing amount (like Reference implementation's _updateClearing)
        // This is critical: we must update the clearing amount BEFORE reading it in execution functions
        uint256 clearingLabaf = AdjustBalancesStorageWrapper.getClearingLabafById(_clearingOperationIdentifier);
        if (abaf != clearingLabaf) {
            uint256 clearingFactor = AdjustBalancesStorageWrapper.calculateFactor(abaf, clearingLabaf);
            ClearingStorageWrapper.updateClearingAmountById(_clearingOperationIdentifier, clearingFactor);
            AdjustBalancesStorageWrapper.setClearedLabafById(_clearingOperationIdentifier, abaf);
        }
    }

    function updateClearing(
        IClearingTypes.ClearingOperationIdentifier calldata _clearingOperationIdentifier,
        bytes32 _partition,
        address _tokenHolder
    ) internal returns (uint256 abaf_) {
        TokenCoreOps.triggerAndSyncAll(_partition, _clearingOperationIdentifier.tokenHolder, address(0));

        uint256 clearingLabaf = AdjustBalancesStorageWrapper.getClearingLabafById(_clearingOperationIdentifier);
        uint256 _abaf = AdjustBalancesStorageWrapper.getAbaf();

        abaf_ = _abaf;

        // Early return if factor is 1 (clearing created after balance adjustment)
        if (_abaf == clearingLabaf) {
            return abaf_;
        }

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
        IClearingTypes.ClearingOperationIdentifier calldata _clearingOperationIdentifier
    ) internal returns (uint256 amount_) {
        IClearingTypes.ClearingOperationBasicInfo memory data = ClearingStorageWrapper.isClearingBasicInfo(
            _clearingOperationIdentifier
        );
        amount_ = data.amount;

        restoreClearingAllowance(_clearingOperationIdentifier, amount_);
        ClearingStorageWrapper.removeClearing(_clearingOperationIdentifier);
    }

    function restoreClearingAllowance(
        IClearingTypes.ClearingOperationIdentifier calldata _clearingOperationIdentifier,
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
}
