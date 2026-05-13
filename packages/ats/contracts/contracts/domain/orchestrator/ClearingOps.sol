// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ClearingStorageWrapper } from "../asset/ClearingStorageWrapper.sol";
import { AdjustBalancesStorageWrapper } from "../asset/AdjustBalancesStorageWrapper.sol";
import { TokenCoreOps } from "./TokenCoreOps.sol";
import { ERC1410StorageWrapper } from "../asset/ERC1410StorageWrapper.sol";
import { ERC20StorageWrapper } from "../asset/ERC20StorageWrapper.sol";
import { SnapshotsStorageWrapper } from "../asset/SnapshotsStorageWrapper.sol";
import { HoldStorageWrapper } from "../asset/HoldStorageWrapper.sol";
import { IERC1410Types } from "../../facets/layer_1/ERC1400/ERC1410/IERC1410Types.sol";
import { IClearingTypes } from "../../facets/layer_1/clearing/IClearingTypes.sol";
import {
    IOperatorClearingHoldByPartition
} from "../../facets/layer_1/clearing/operatorClearingHoldByPartition/IOperatorClearingHoldByPartition.sol";
import { IHoldTypes } from "../../facets/layer_1/hold/IHoldTypes.sol";
import { ThirdPartyType } from "../asset/types/ThirdPartyType.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";

/**
 * @title ClearingOps - Orchestrator for clearing creation operations
 * @notice Library that owns the creation phase of the clearing protocol:
 * deferred transfers, redeems, and hold creations; per-partition allowance
 * bookkeeping; ABAF (Accumulative Balance Adjustment Factor) synchronisation;
 * and emission of the cleared-creation events. The post-creation lifecycle
 * (approve, cancel, reclaim, dispatch, balance restoration) lives in the
 * sibling `ClearingLifecycleOps` library.
 * @dev Deployed once as a separate contract. Facets call via DELEGATECALL.
 * All functions mutate state through StorageWrappers and emit clearing-
 * specific events. Cleared funds are held in a separate balance ledger
 * until the clearing operation is resolved. ABAF adjustments are applied
 * atomically before any operation execution to ensure balance integrity.
 * Extracted from a single monolithic library to keep deployed bytecode
 * below the EIP-170 24 KiB runtime cap.
 * @author Asset Tokenization Studio Team
 */
library ClearingOps {
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
    ) external returns (bool success_, uint256 clearingId_) {
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

        ERC1410StorageWrapper.reducePartitionOnly(_from, _amount, partition);
        ClearingStorageWrapper.increaseClearedAmounts(_from, partition, _amount);

        ERC20StorageWrapper.performTransfer(_from, address(0), _amount);

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
     * cleared amount, and stores the redeem metadata. Mirrors the canonical
     * `redeemByPartition` balance-movement events: emits the ERC-20 `Transfer`
     * (via `performTransfer`) and the ERC-1410 burn-side `TransferByPartition`,
     * keeping observers in sync with the holder's debit. Emits a third-party-
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
    ) external returns (bool success_, uint256 clearingId_) {
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

        ERC1410StorageWrapper.reducePartitionOnly(_from, _amount, partition);
        ClearingStorageWrapper.increaseClearedAmounts(_from, partition, _amount);

        ERC20StorageWrapper.performTransfer(_from, address(0), _amount);

        // Mirror redeemByPartition: emit the burn-side TransferByPartition so
        // observers tracking ERC-1410 burns through this event see the debit
        emit IERC1410Types.TransferByPartition(
            partition,
            EvmAccessors.getMsgSender(),
            _from,
            address(0),
            _amount,
            _clearingOperation.data,
            _operatorData
        );

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
    ) external returns (bool success_, uint256 clearingId_) {
        HoldStorageWrapper.checkNonZeroHoldAmount(_hold.amount);

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

        ERC1410StorageWrapper.reducePartitionOnly(_from, _hold.amount, partition);
        ClearingStorageWrapper.increaseClearedAmounts(_from, partition, _hold.amount);

        ERC20StorageWrapper.performTransfer(_from, address(0), _hold.amount);

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
    ) external {
        address spender = EvmAccessors.getMsgSender();
        TokenCoreOps.decreaseAllowedBalance(_from, spender, _amount);
        ClearingStorageWrapper.setClearingThirdParty(_partition, _from, _clearingOperationType, _clearingId, spender);
    }

    // ============================================================================
    // INTERNAL: ABAF SYNCHRONISATION
    // ============================================================================

    /**
     * @notice Hook executed before any clearing operation to synchronise
     * ABAF adjustments
     * @dev Delegates to the batched variant `beforeClearingOperationBatched`
     * to reduce delegatecall overhead. This function triggers ERC1410
     * partition sync, updates account and cleared balance snapshots, and
     * applies ABAF adjustments to total cleared amounts and individual
     * clearing amounts if the ABAF factor has changed. Also reused by
     * `ClearingLifecycleOps.handleClearingOperationByPartition` via an
     * `internal` cross-library call that the compiler inlines.
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
    ) private {
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

    // ============================================================================
    // INTERNAL: CREATION-PHASE EVENT EMITTERS
    // ============================================================================

    /**
     * @notice Emits a cleared transfer event appropriate to the third party type.
     * @dev Dispatches to one of three event variants:
     *      `ClearedTransferByPartition` (NULL),
     *      `ClearedTransferFromByPartition` (AUTHORISED),
     *      `ClearedOperatorTransferByPartition` (OPERATOR).
     *      Emits nothing when `_thirdPartyType == PROTECTED` — the protected variant's event
     *      (`ProtectedClearedTransferByPartition`) is owned and emitted by the writer
     *      (`ProtectedClearingByPartitionFacet.protectedClearingTransferByPartition`),
     *      keeping a single emit per external call (per the project event-emission rule).
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
    ) private {
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
    }

    /**
     * @notice Emits a cleared redeem event appropriate to the third party type.
     * @dev Dispatches to one of three event variants:
     *      `ClearedRedeemByPartition` (NULL),
     *      `ClearedRedeemFromByPartition` (AUTHORISED),
     *      `ClearedOperatorRedeemByPartition` (OPERATOR).
     *      Emits nothing when `_thirdPartyType == PROTECTED` — the protected variant's event
     *      (`ProtectedClearedRedeemByPartition`) is owned and emitted by the writer
     *      (`ProtectedClearingByPartitionFacet.protectedClearingRedeemByPartition`),
     *      keeping a single emit per external call (per the project event-emission rule).
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
    ) private {
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
    }

    /**
     * @notice Emits a cleared hold event appropriate to the third party type.
     * @dev Dispatches to one of three event variants:
     *      `ClearedHoldByPartition` (NULL),
     *      `ClearedHoldFromByPartition` (AUTHORISED),
     *      `ClearedOperatorHoldByPartition` (OPERATOR).
     *      Emits nothing when `_thirdPartyType == PROTECTED` — the protected variant's event
     *      (`ProtectedClearedHoldByPartition`) is owned and emitted by the writer
     *      (`ProtectedClearingHoldByPartitionFacet.protectedClearingCreateHoldByPartition`),
     *      keeping a single emit per external call (per the project event-emission rule).
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
    ) private {
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
    }
}
