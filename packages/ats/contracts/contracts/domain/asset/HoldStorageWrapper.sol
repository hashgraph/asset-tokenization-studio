// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _HOLD_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { _DEFAULT_PARTITION } from "../../constants/values.sol";
import { Pagination } from "../../infrastructure/utils/Pagination.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { IHoldTypes } from "../../facets/layer_1/hold/IHoldTypes.sol";
import { ICompliance } from "../../facets/layer_1/ERC3643/ICompliance.sol";
import { IERC3643Types } from "../../facets/layer_1/ERC3643/IERC3643Types.sol";
import { IERC20 } from "../../facets/layer_1/ERC1400/ERC20/IERC20.sol";
import { ERC20StorageWrapper } from "./ERC20StorageWrapper.sol";
import { IERC1410Types } from "../../facets/layer_1/ERC1400/ERC1410/IERC1410Types.sol";
import { ThirdPartyType } from "./types/ThirdPartyType.sol";
import { LowLevelCall } from "../../infrastructure/utils/LowLevelCall.sol";
import { _checkNonceAndDeadline } from "../../infrastructure/utils/ERC712.sol";
import { ERC1410StorageWrapper } from "./ERC1410StorageWrapper.sol";
import { AdjustBalancesStorageWrapper } from "./AdjustBalancesStorageWrapper.sol";
import { SnapshotsStorageWrapper } from "./SnapshotsStorageWrapper.sol";
import { ERC3643StorageWrapper } from "../core/ERC3643StorageWrapper.sol";
import { LockStorageWrapper } from "../asset/LockStorageWrapper.sol";
import { NonceStorageWrapper } from "../core/NonceStorageWrapper.sol";
import { ProtectedPartitionsStorageWrapper } from "../core/ProtectedPartitionsStorageWrapper.sol";
import { ControlListStorageWrapper } from "../core/ControlListStorageWrapper.sol";
import { ICommonErrors } from "../../infrastructure/errors/ICommonErrors.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";

/**
 * @title  HoldStorageWrapper
 * @notice Internal library providing storage operations for the token hold mechanism,
 *         including hold creation, execution, release, reclaim, ABAF adjustment, and
 *         multi-partition held balance tracking.
 * @dev    Anchors `HoldDataStorage` at `_HOLD_STORAGE_POSITION` following the ERC-2535
 *         Diamond Storage Pattern. All functions are `internal` and intended exclusively
 *         for use within facets or other internal libraries of the same diamond.
 *
 *         Hold IDs are one-based, per-account, per-partition monotonic counters derived
 *         from `nextHoldIdByAccountAndPartition`. A value of `0` for `HoldData.id`
 *         indicates a non-existent or deleted hold.
 *
 *         Both aggregate (`totalHeldAmountByAccount`) and per-partition
 *         (`totalHeldAmountByAccountAndPartition`) held amount accumulators are
 *         maintained in parallel and are subject to ABAF scaling via dedicated LABAF
 *         tracking. Individual hold amounts are also ABAF-adjusted at the hold level
 *         via per-hold LABAF entries managed by `AdjustBalancesStorageWrapper`.
 *
 *         Three hold operations are supported:
 *           - Execute  — escrow transfers held tokens to a designated destination.
 *           - Release  — escrow returns held tokens to the token holder.
 *           - Reclaim  — token holder retrieves expired held tokens unilaterally.
 *
 *         For `AUTHORIZED` third-party holds, the consumed allowance is restored to
 *         `msg.sender` on release or reclaim. For `PROTECTED` holds, EIP-712 signature
 *         and nonce validation are enforced before creation.
 *
 *         Block timestamps are sourced from `TimeTravelStorageWrapper` to support
 *         test-environment time manipulation without affecting production logic.
 * @author Hashgraph
 */
library HoldStorageWrapper {
    using Pagination for EnumerableSet.UintSet;
    using EnumerableSet for EnumerableSet.UintSet;
    using LowLevelCall for address;

    /**
     * @notice Diamond Storage struct for the hold subsystem.
     * @dev    Stored at `_HOLD_STORAGE_POSITION`. `totalHeldAmountByAccount` and
     *         `totalHeldAmountByAccountAndPartition` must remain consistent with the sum
     *         of individual hold amounts across all active holds for a given holder.
     *         `holdIdsByAccountAndPartition` is the authoritative set of active hold IDs;
     *         a hold is considered active if and only if its ID is present in this set.
     * @param totalHeldAmountByAccount
     *        Aggregate held token quantity per account across all partitions.
     * @param totalHeldAmountByAccountAndPartition
     *        Aggregate held token quantity per account and partition.
     * @param holdsByAccountPartitionAndId
     *        Maps (account, partition, holdId) to the full `HoldData` record.
     * @param holdIdsByAccountAndPartition
     *        Enumerable set of active hold IDs per account and partition.
     * @param nextHoldIdByAccountAndPartition
     *        Monotonically increasing counter tracking the last assigned hold ID per
     *        account and partition; the next ID is `current + 1`.
     * @param holdThirdPartyByAccountPartitionAndId
     *        Maps (account, partition, holdId) to the associated third-party operator
     *        address (e.g. the spender whose allowance was consumed on hold creation).
     */
    struct HoldDataStorage {
        mapping(address => uint256) totalHeldAmountByAccount;
        mapping(address => mapping(bytes32 => uint256)) totalHeldAmountByAccountAndPartition;
        mapping(address => mapping(bytes32 => mapping(uint256 => IHoldTypes.HoldData))) holdsByAccountPartitionAndId;
        mapping(address => mapping(bytes32 => EnumerableSet.UintSet)) holdIdsByAccountAndPartition;
        mapping(address => mapping(bytes32 => uint256)) nextHoldIdByAccountAndPartition;
        mapping(address => mapping(bytes32 => mapping(uint256 => address))) holdThirdPartyByAccountPartitionAndId;
    }

    /**
     * @notice Creates a new hold on a partition, moving the held tokens out of the
     *         token holder's spendable balance.
     * @dev    Execution order:
     *           1. `_prepareHoldCreation` — triggers pending scheduled tasks and syncs
     *              balance adjustments.
     *           2. `updateTotalHold` — syncs ABAF on aggregate held accumulators.
     *           3. `beforeHold` — updates account and held-balance snapshots.
     *           4. `ERC1410StorageWrapper.reduceBalanceByPartition` — removes tokens from
     *              spendable balance.
     *           5. `_storeHold` — persists the hold record and updates accumulators.
     *           6. `_emitHoldCreationEvents` — emits `TransferByPartition` and
     *              `IERC20.Transfer` to `address(0)`.
     *         Reverts with `IERC20.InsufficientBalance` if the partition balance is
     *         insufficient.
     *         Emits: `IERC1410Types.TransferByPartition`, `IERC20.Transfer`.
     * @param _partition      Partition under which the hold is created.
     * @param _from           Address whose tokens are placed on hold.
     * @param _hold           Hold parameters including amount, escrow, expiry, and
     *                        destination.
     * @param _operatorData   Arbitrary operator data stored with the hold record.
     * @param _thirdPartyType Classification of the third party initiating the hold.
     * @return success_  Always `true` on successful creation.
     * @return holdId_   One-based hold ID assigned to the new hold.
     */
    function createHoldByPartition(
        bytes32 _partition,
        address _from,
        IHoldTypes.Hold memory _hold,
        bytes memory _operatorData,
        ThirdPartyType _thirdPartyType
    ) internal returns (bool success_, uint256 holdId_) {
        _prepareHoldCreation(_partition, _from);
        uint256 abaf = updateTotalHold(_partition, _from);
        beforeHold(_partition, _from);
        ERC1410StorageWrapper.reduceBalanceByPartition(_from, _hold.amount, _partition);
        holdId_ = _storeHold(_partition, _from, _hold, _operatorData, _thirdPartyType, abaf);
        _emitHoldCreationEvents(_partition, _from, _hold.amount, _operatorData);
        return (true, holdId_);
    }

    /**
     * @notice Creates a hold on behalf of a token holder using an EIP-712 signature,
     *         validating nonce and deadline before execution.
     * @dev    Validates the nonce and deadline via `_checkNonceAndDeadline`, then
     *         verifies the EIP-712 create-hold signature via
     *         `ProtectedPartitionsStorageWrapper.checkCreateHoldSignature` using the
     *         stored token name. The nonce is consumed via `NonceStorageWrapper` before
     *         the hold is created. Delegates to `createHoldByPartition` with
     *         `ThirdPartyType.PROTECTED`. All downstream preconditions of
     *         `createHoldByPartition` apply.
     *         Emits: `IERC1410Types.TransferByPartition`, `IERC20.Transfer`.
     * @param _partition       Partition under which the hold is created.
     * @param _from            Address whose signature authorises the hold.
     * @param _protectedHold   Struct containing hold parameters, nonce, and deadline.
     * @param _signature       EIP-712 signature over the hold creation parameters.
     * @return success_  Always `true` on successful creation.
     * @return holdId_   One-based hold ID assigned to the new hold.
     */
    function protectedCreateHoldByPartition(
        bytes32 _partition,
        address _from,
        IHoldTypes.ProtectedHold memory _protectedHold,
        bytes calldata _signature
    ) internal returns (bool success_, uint256 holdId_) {
        _checkNonceAndDeadline(
            _protectedHold.nonce,
            _from,
            NonceStorageWrapper.getNonceFor(_from),
            _protectedHold.deadline,
            TimeTravelStorageWrapper.getBlockTimestamp()
        );
        ProtectedPartitionsStorageWrapper.checkCreateHoldSignature(
            _partition,
            _from,
            _protectedHold,
            _signature,
            ERC20StorageWrapper.getName()
        );
        NonceStorageWrapper.setNonceFor(_protectedHold.nonce, _from);
        return createHoldByPartition(_partition, _from, _protectedHold.hold, "", ThirdPartyType.PROTECTED);
    }

    /**
     * @notice Decrements the ERC20 allowance granted by `_from` to `msg.sender` by
     *         `_amount` and records `msg.sender` as the third-party operator for the
     *         hold.
     * @dev    Must be called when an `AUTHORIZED` third party creates a hold using the
     *         token holder's allowance. The third-party address is stored per
     *         (account, partition, holdId) for later allowance restoration on release
     *         or reclaim. Reverts with `IERC20.InsufficientAllowance` if the allowance
     *         is insufficient.
     * @param _partition  Partition under which the hold is being created.
     * @param _from       Address whose allowance is consumed.
     * @param _amount     Amount to deduct from the allowance.
     * @param _holdId     Hold ID with which the third-party address is associated.
     */
    function decreaseAllowedBalanceForHold(
        bytes32 _partition,
        address _from,
        uint256 _amount,
        uint256 _holdId
    ) internal {
        address thirdPartyAddress = EvmAccessors.getMsgSender();
        ERC20StorageWrapper.decreaseAllowedBalance(_from, thirdPartyAddress, _amount);
        holdStorage().holdThirdPartyByAccountPartitionAndId[_from][_partition][_holdId] = thirdPartyAddress;
    }

    /**
     * @notice Executes a hold, transferring the specified amount from the held balance
     *         to the destination address.
     * @dev    Calls `beforeExecuteHold` to sync balance adjustments and snapshots, then
     *         delegates to `operateHoldByPartition` with `OperationType.Execute`.
     *         If the hold amount reaches zero after the operation, the hold-level LABAF
     *         entry is removed. Reverts with `IHoldTypes.IsNotEscrow` if `msg.sender`
     *         is not the designated escrow, `IHoldTypes.HoldExpirationReached` if the
     *         hold has expired, or `IHoldTypes.InvalidDestinationAddress` if `_to` does
     *         not match the hold's designated destination (when non-zero).
     *         Emits: `IERC1410Types.TransferByPartition`, `IERC20.Transfer`,
     *                `ICompliance.transferred` (default partition only, when applicable).
     * @param _holdIdentifier  Struct identifying the token holder, partition, and hold ID.
     * @param _to              Destination address to receive the executed tokens.
     * @param _amount          Token quantity to execute from the hold.
     * @return success_    Always `true` on successful execution.
     * @return partition_  Partition under which the hold was executed.
     */
    function executeHoldByPartition(
        IHoldTypes.HoldIdentifier calldata _holdIdentifier,
        address _to,
        uint256 _amount
    ) internal returns (bool success_, bytes32 partition_) {
        beforeExecuteHold(_holdIdentifier, _to);
        success_ = operateHoldByPartition(_holdIdentifier, _to, _amount, IHoldTypes.OperationType.Execute);
        partition_ = _holdIdentifier.partition;
        if (getHold(_holdIdentifier).hold.amount == 0) {
            AdjustBalancesStorageWrapper.removeLabafHold(
                _holdIdentifier.partition,
                _holdIdentifier.tokenHolder,
                _holdIdentifier.holdId
            );
        }
    }

    /**
     * @notice Releases a hold, returning the specified amount to the token holder's
     *         spendable balance.
     * @dev    Calls `beforeReleaseHold`, restores the allowance if the hold is of type
     *         `AUTHORIZED`, then delegates to `operateHoldByPartition` with
     *         `OperationType.Release`. If the hold amount reaches zero, the hold-level
     *         LABAF entry is removed. Reverts with `IHoldTypes.IsNotEscrow` if
     *         `msg.sender` is not the designated escrow, or
     *         `IHoldTypes.HoldExpirationReached` if the hold has expired.
     *         Emits: `IERC1410Types.TransferByPartition`, `IERC20.Transfer`.
     * @param _holdIdentifier  Struct identifying the token holder, partition, and hold ID.
     * @param _amount          Token quantity to release back to the token holder.
     * @return success_  Always `true` on successful release.
     */
    function releaseHoldByPartition(
        IHoldTypes.HoldIdentifier calldata _holdIdentifier,
        uint256 _amount
    ) internal returns (bool success_) {
        beforeReleaseHold(_holdIdentifier);
        _restoreHoldAllowance(getHold(_holdIdentifier).thirdPartyType, _holdIdentifier, _amount);
        success_ = operateHoldByPartition(
            _holdIdentifier,
            _holdIdentifier.tokenHolder,
            _amount,
            IHoldTypes.OperationType.Release
        );
        if (getHold(_holdIdentifier).hold.amount == 0) {
            AdjustBalancesStorageWrapper.removeLabafHold(
                _holdIdentifier.partition,
                _holdIdentifier.tokenHolder,
                _holdIdentifier.holdId
            );
        }
    }

    /**
     * @notice Reclaims the full amount of an expired hold, returning it to the token
     *         holder's spendable balance.
     * @dev    Calls `beforeReclaimHold`, captures the full hold amount, restores the
     *         allowance if applicable, then delegates to `operateHoldByPartition` with
     *         `OperationType.Reclaim`. The hold-level LABAF entry is always removed
     *         after reclaim. Reverts with `IHoldTypes.HoldExpirationNotReached` if the
     *         hold has not yet expired.
     *         Emits: `IERC1410Types.TransferByPartition`, `IERC20.Transfer`.
     * @param _holdIdentifier  Struct identifying the token holder, partition, and hold ID.
     * @return success_  Always `true` on successful reclaim.
     * @return amount_   Total token quantity reclaimed from the hold.
     */
    function reclaimHoldByPartition(
        IHoldTypes.HoldIdentifier calldata _holdIdentifier
    ) internal returns (bool success_, uint256 amount_) {
        beforeReclaimHold(_holdIdentifier);
        IHoldTypes.HoldData memory holdData = getHold(_holdIdentifier);
        amount_ = holdData.hold.amount;
        _restoreHoldAllowance(holdData.thirdPartyType, _holdIdentifier, amount_);
        success_ = operateHoldByPartition(
            _holdIdentifier,
            _holdIdentifier.tokenHolder,
            amount_,
            IHoldTypes.OperationType.Reclaim
        );
        AdjustBalancesStorageWrapper.removeLabafHold(
            _holdIdentifier.partition,
            _holdIdentifier.tokenHolder,
            _holdIdentifier.holdId
        );
    }

    /**
     * @notice Validates and executes a hold operation (Execute, Release, or Reclaim),
     *         transferring `_amount` from the held balance to `_to`.
     * @dev    Reads the current hold data, validates the operation via
     *         `_validateHoldOperation`, checks the requested amount does not exceed the
     *         held balance, then delegates to `transferHold`. Reverts with
     *         `IHoldTypes.InsufficientHoldBalance` if `_amount` exceeds the hold amount.
     * @param _holdIdentifier  Struct identifying the token holder, partition, and hold ID.
     * @param _to              Address to receive the tokens.
     * @param _amount          Token quantity to operate on.
     * @param _operation       The type of hold operation to perform.
     * @return success_  Always `true` on successful execution.
     */
    function operateHoldByPartition(
        IHoldTypes.HoldIdentifier calldata _holdIdentifier,
        address _to,
        uint256 _amount,
        IHoldTypes.OperationType _operation
    ) internal returns (bool success_) {
        IHoldTypes.HoldData memory holdData = getHold(_holdIdentifier);
        _validateHoldOperation(_holdIdentifier, holdData, _to, _operation);
        checkHoldAmount(_amount, holdData);
        transferHold(_holdIdentifier, _to, _amount);
        return true;
    }

    /**
     * @notice Decrements or removes the hold record, transfers the balance to the
     *         destination, notifies the compliance module if required, and emits
     *         transfer events.
     * @dev    Calls `_decreaseOrRemoveHold` (which removes the hold entirely if the
     *         remaining amount reaches zero), then `_transferHoldBalance` to restore or
     *         redirect the balance in the ERC1410 partition model. Calls
     *         `_notifyTransferComplianceIfNeeded` for default-partition transfers between
     *         distinct addresses. Emits `TransferByPartition` from `address(0)` and
     *         `IERC20.Transfer` from `address(0)`.
     * @param _holdIdentifier  Struct identifying the token holder, partition, and hold ID.
     * @param _to              Destination address to receive the balance.
     * @param _amount          Token quantity to transfer.
     */
    function transferHold(IHoldTypes.HoldIdentifier calldata _holdIdentifier, address _to, uint256 _amount) internal {
        _decreaseOrRemoveHold(_holdIdentifier, _amount);
        _transferHoldBalance(_holdIdentifier, _to, _amount);
        _notifyTransferComplianceIfNeeded(_holdIdentifier, _to, _amount);
        _emitHoldTransfer(_holdIdentifier, _to, _amount);
    }

    /**
     * @notice Decrements the aggregate and per-partition held amount accumulators and
     *         the hold's stored amount by `_amount`.
     * @dev    All three fields are decremented in a single storage pointer pass. Callers
     *         must ensure `_amount` does not exceed the hold amount; arithmetic underflow
     *         is not guarded here. Returns the hold's remaining amount after the
     *         decrement for use in conditional removal logic.
     * @param _holdIdentifier  Struct identifying the token holder, partition, and hold ID.
     * @param _amount          Token quantity to deduct from all held amount fields.
     * @return newHoldBalance_  Remaining hold amount after the decrement.
     */
    function decreaseHeldAmount(
        IHoldTypes.HoldIdentifier calldata _holdIdentifier,
        uint256 _amount
    ) internal returns (uint256 newHoldBalance_) {
        HoldDataStorage storage holdStorageRef = holdStorage();
        holdStorageRef.totalHeldAmountByAccount[_holdIdentifier.tokenHolder] -= _amount;
        holdStorageRef.totalHeldAmountByAccountAndPartition[_holdIdentifier.tokenHolder][
            _holdIdentifier.partition
        ] -= _amount;
        holdStorageRef
        .holdsByAccountPartitionAndId[_holdIdentifier.tokenHolder][_holdIdentifier.partition][_holdIdentifier.holdId]
            .hold
            .amount -= _amount;
        newHoldBalance_ = holdStorageRef
        .holdsByAccountPartitionAndId[_holdIdentifier.tokenHolder][_holdIdentifier.partition][_holdIdentifier.holdId]
            .hold
            .amount;
    }

    /**
     * @notice Fully removes a hold record from storage, clears all associated mappings,
     *         and removes the hold-level LABAF entry.
     * @dev    Removes the hold ID from the active enumerable set, deletes the
     *         `holdsByAccountPartitionAndId` and `holdThirdPartyByAccountPartitionAndId`
     *         entries, and calls `AdjustBalancesStorageWrapper.removeLabafHold`. Does
     *         not update the aggregate held amount accumulators; callers must call
     *         `decreaseHeldAmount` beforehand if the amount has not already been zeroed.
     * @param _holdIdentifier  Struct identifying the token holder, partition, and hold ID
     *                         to remove.
     */
    function removeHold(IHoldTypes.HoldIdentifier calldata _holdIdentifier) internal {
        HoldDataStorage storage holdStorageRef = holdStorage();
        holdStorageRef.holdIdsByAccountAndPartition[_holdIdentifier.tokenHolder][_holdIdentifier.partition].remove(
            _holdIdentifier.holdId
        );
        delete holdStorageRef.holdsByAccountPartitionAndId[_holdIdentifier.tokenHolder][_holdIdentifier.partition][
            _holdIdentifier.holdId
        ];
        delete holdStorageRef.holdThirdPartyByAccountPartitionAndId[_holdIdentifier.tokenHolder][
            _holdIdentifier.partition
        ][_holdIdentifier.holdId];
        AdjustBalancesStorageWrapper.removeLabafHold(
            _holdIdentifier.partition,
            _holdIdentifier.tokenHolder,
            _holdIdentifier.holdId
        );
    }

    /**
     * @notice Synchronises the aggregate and per-partition held ABAF for a token holder,
     *         scaling the stored held amounts by any outstanding adjustment factor, and
     *         returns the current ABAF.
     * @dev    Reads the current ABAF and compares it against both the aggregate held
     *         LABAF and the partition-specific held LABAF. If either diverges, the
     *         corresponding accumulator is multiplied by the calculated factor and the
     *         LABAF is updated. Must be called before any held amount mutation to ensure
     *         stored amounts reflect the current adjustment state.
     * @param _partition    Partition whose held LABAF is to be synchronised.
     * @param _tokenHolder  Account whose held amounts are to be adjusted.
     * @return abaf_  Current global ABAF value at the time of the call.
     */
    function updateTotalHold(bytes32 _partition, address _tokenHolder) internal returns (uint256 abaf_) {
        abaf_ = AdjustBalancesStorageWrapper.getAbaf();
        uint256 labaf = AdjustBalancesStorageWrapper.getTotalHeldLabaf(_tokenHolder);
        uint256 labafByPartition = AdjustBalancesStorageWrapper.getTotalHeldLabafByPartition(_partition, _tokenHolder);
        if (abaf_ != labaf) {
            updateTotalHeldAmountAndLabaf(
                _tokenHolder,
                AdjustBalancesStorageWrapper.calculateFactor(abaf_, labaf),
                abaf_
            );
        }
        if (abaf_ != labafByPartition) {
            updateTotalHeldAmountAndLabafByPartition(
                _partition,
                _tokenHolder,
                AdjustBalancesStorageWrapper.calculateFactor(abaf_, labafByPartition),
                abaf_
            );
        }
    }

    /**
     * @notice Scales the aggregate held token amount for a holder by `_factor` and
     *         updates the stored aggregate held LABAF to `_abaf`.
     * @dev    Intended to be called only from `updateTotalHold` after confirming that
     *         the current ABAF diverges from the stored LABAF. Callers must ensure
     *         `_factor` is non-zero.
     * @param _tokenHolder  Account whose aggregate held amount is scaled.
     * @param _factor       Multiplicative scaling factor derived from `(abaf, labaf)`.
     * @param _abaf         Current ABAF value to store as the updated LABAF.
     */
    function updateTotalHeldAmountAndLabaf(address _tokenHolder, uint256 _factor, uint256 _abaf) internal {
        holdStorage().totalHeldAmountByAccount[_tokenHolder] *= _factor;
        AdjustBalancesStorageWrapper.setTotalHeldLabaf(_tokenHolder, _abaf);
    }

    /**
     * @notice Scales the per-partition held token amount for a holder by `_factor` and
     *         updates the stored partition-specific held LABAF to `_abaf`.
     * @dev    Intended to be called only from `updateTotalHold` after confirming that
     *         the current ABAF diverges from the stored partition LABAF. Callers must
     *         ensure `_factor` is non-zero.
     * @param _partition    Partition whose held amount is scaled.
     * @param _tokenHolder  Account whose partition held amount is scaled.
     * @param _factor       Multiplicative scaling factor.
     * @param _abaf         Current ABAF value to store as the updated partition LABAF.
     */
    function updateTotalHeldAmountAndLabafByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _factor,
        uint256 _abaf
    ) internal {
        holdStorage().totalHeldAmountByAccountAndPartition[_tokenHolder][_partition] *= _factor;
        AdjustBalancesStorageWrapper.setTotalHeldLabafByPartition(_partition, _tokenHolder, _abaf);
    }

    /**
     * @notice Synchronises all pending balance adjustments for the hold's participants
     *         and applies any outstanding ABAF factor to the individual hold record.
     * @dev    Calls `ERC1410StorageWrapper.triggerAndSyncAll` to process pending
     *         scheduled tasks and sync partition balances for `tokenHolder` and `_to`,
     *         then syncs the aggregate held ABAF via `updateTotalHold` and applies the
     *         per-hold ABAF factor via `updateHold`. Must be called before any hold
     *         execution, release, or reclaim to ensure ABAF consistency.
     * @param _holdIdentifier  Struct identifying the token holder, partition, and hold ID.
     * @param _to              Destination address whose balance adjustments are also
     *                         synchronised.
     */
    function adjustHoldBalances(IHoldTypes.HoldIdentifier calldata _holdIdentifier, address _to) internal {
        ERC1410StorageWrapper.triggerAndSyncAll(_holdIdentifier.partition, _holdIdentifier.tokenHolder, _to);
        updateHold(
            _holdIdentifier.partition,
            _holdIdentifier.holdId,
            _holdIdentifier.tokenHolder,
            updateTotalHold(_holdIdentifier.partition, _holdIdentifier.tokenHolder)
        );
    }

    /**
     * @notice Applies the current ABAF to a specific hold's stored amount if the
     *         hold-level LABAF has diverged from the current ABAF.
     * @dev    Reads the hold-level LABAF and returns immediately if it matches `_abaf`
     *         (no-op). Otherwise scales the hold amount via `updateHoldAmountById` and
     *         updates the hold LABAF. Callers must ensure `_abaf` reflects the
     *         post-`updateTotalHold` ABAF for consistency.
     * @param _partition    Partition of the hold to update.
     * @param _holdId       Hold ID to update.
     * @param _tokenHolder  Account that owns the hold.
     * @param _abaf         Current ABAF value to apply and record.
     */
    function updateHold(bytes32 _partition, uint256 _holdId, address _tokenHolder, uint256 _abaf) internal {
        uint256 holdLabaf = AdjustBalancesStorageWrapper.getHoldLabafById(_partition, _tokenHolder, _holdId);
        if (_abaf == holdLabaf) return;
        updateHoldAmountById(
            _partition,
            _holdId,
            _tokenHolder,
            AdjustBalancesStorageWrapper.calculateFactor(_abaf, holdLabaf)
        );
        AdjustBalancesStorageWrapper.setHeldLabafById(_partition, _tokenHolder, _holdId, _abaf);
    }

    /**
     * @notice Scales the stored amount of a specific hold by a multiplicative factor.
     * @dev    Intended to be called only from `updateHold` after confirming the
     *         hold-level LABAF has diverged. Callers must ensure `_factor` is non-zero.
     * @param _partition    Partition of the hold.
     * @param _holdId       Hold ID whose amount is scaled.
     * @param _tokenHolder  Account that owns the hold.
     * @param _factor       Multiplicative scaling factor.
     */
    function updateHoldAmountById(bytes32 _partition, uint256 _holdId, address _tokenHolder, uint256 _factor) internal {
        holdStorage().holdsByAccountPartitionAndId[_tokenHolder][_partition][_holdId].hold.amount *= _factor;
    }

    /**
     * @notice Updates the account and held-balance snapshots immediately before a hold
     *         is created.
     * @dev    Must be called after `updateTotalHold` and before the partition balance
     *         reduction to capture a consistent pre-hold snapshot state.
     * @param _partition    Partition under which the hold is being created.
     * @param _tokenHolder  Address whose snapshots are to be updated.
     */
    function beforeHold(bytes32 _partition, address _tokenHolder) internal {
        SnapshotsStorageWrapper.updateAccountSnapshot(_tokenHolder, _partition);
        SnapshotsStorageWrapper.updateAccountHeldBalancesSnapshot(_tokenHolder, _partition);
    }

    /**
     * @notice Synchronises balance adjustments and updates snapshots for both the token
     *         holder and the destination address before a hold is executed.
     * @dev    Calls `adjustHoldBalances` to trigger pending tasks and sync ABAF, then
     *         updates the `_to` account snapshot and the token holder's held-balance
     *         snapshot. Must be called before `operateHoldByPartition` for execute
     *         operations.
     * @param _holdIdentifier  Struct identifying the token holder, partition, and hold ID.
     * @param _to              Destination address whose snapshot is also updated.
     */
    function beforeExecuteHold(IHoldTypes.HoldIdentifier calldata _holdIdentifier, address _to) internal {
        adjustHoldBalances(_holdIdentifier, _to);
        SnapshotsStorageWrapper.updateAccountSnapshot(_to, _holdIdentifier.partition);
        SnapshotsStorageWrapper.updateAccountHeldBalancesSnapshot(
            _holdIdentifier.tokenHolder,
            _holdIdentifier.partition
        );
    }

    /**
     * @notice Executes pre-release state synchronisation and snapshot updates.
     * @dev    Delegates entirely to `beforeExecuteHold` with the token holder as the
     *         destination, as releasing returns tokens to the holder.
     * @param _holdIdentifier  Struct identifying the token holder, partition, and hold ID.
     */
    function beforeReleaseHold(IHoldTypes.HoldIdentifier calldata _holdIdentifier) internal {
        beforeExecuteHold(_holdIdentifier, _holdIdentifier.tokenHolder);
    }

    /**
     * @notice Executes pre-reclaim state synchronisation and snapshot updates.
     * @dev    Delegates entirely to `beforeExecuteHold` with the token holder as the
     *         destination, as reclaiming returns tokens to the holder.
     * @param _holdIdentifier  Struct identifying the token holder, partition, and hold ID.
     */
    function beforeReclaimHold(IHoldTypes.HoldIdentifier calldata _holdIdentifier) internal {
        beforeExecuteHold(_holdIdentifier, _holdIdentifier.tokenHolder);
    }

    /**
     * @notice Releases a specified amount from a hold associated with an amortisation
     *         schedule, restoring the allowance if the hold is `AUTHORIZED`.
     * @dev    Validates that the hold has sufficient balance, then either removes the
     *         hold entirely (if fully consumed) or decrements its amount. Updates both
     *         the aggregate and per-partition held amount accumulators. Restores the
     *         ERC20 allowance to the stored third-party address if the hold type is
     *         `AUTHORIZED` and a non-zero third party is registered. Does NOT restore
     *         the partition balance; the caller is responsible for returning tokens to
     *         the appropriate spendable account via a separate mechanism.
     *         Reverts with `IHoldTypes.InsufficientHoldBalance` if the hold amount is
     *         less than `_amount`.
     * @param _tokenHolder  Address that owns the hold.
     * @param _holdId       Hold ID from which to release.
     * @param _amount       Token quantity to release from the hold.
     * @param _partition    Partition under which the hold was created.
     */
    function releaseAmortization(address _tokenHolder, uint256 _holdId, uint256 _amount, bytes32 _partition) internal {
        HoldDataStorage storage holdStorageRef = holdStorage();
        IHoldTypes.HoldData storage holdData = holdStorageRef.holdsByAccountPartitionAndId[_tokenHolder][_partition][
            _holdId
        ];
        if (holdData.hold.amount < _amount) {
            revert IHoldTypes.InsufficientHoldBalance(holdData.hold.amount, _amount);
        }
        if (_amount == holdData.hold.amount) {
            holdStorageRef.holdIdsByAccountAndPartition[_tokenHolder][_partition].remove(_holdId);
            delete holdStorageRef.holdsByAccountPartitionAndId[_tokenHolder][_partition][_holdId];
            delete holdStorageRef.holdThirdPartyByAccountPartitionAndId[_tokenHolder][_partition][_holdId];
        } else {
            holdData.hold.amount -= _amount;
        }
        holdStorageRef.totalHeldAmountByAccount[_tokenHolder] -= _amount;
        holdStorageRef.totalHeldAmountByAccountAndPartition[_tokenHolder][_partition] -= _amount;
        if (holdData.thirdPartyType == ThirdPartyType.AUTHORIZED) {
            address thirdParty = holdStorageRef.holdThirdPartyByAccountPartitionAndId[_tokenHolder][_partition][
                _holdId
            ];
            if (thirdParty != address(0)) {
                ERC20StorageWrapper.increaseAllowedBalance(_tokenHolder, thirdParty, _amount);
            }
        }
    }

    /**
     * @notice Returns the aggregate held amount for a token holder scaled by the ABAF
     *         ratio at the given timestamp.
     * @dev    Multiplies the raw held amount by the factor derived from
     *         `calculateFactorForHeldAmountByTokenHolderAdjustedAt`. Read-only
     *         projection; no state is mutated.
     * @param _tokenHolder  Address to query.
     * @param _timestamp    Unix timestamp at which to evaluate the ABAF adjustment.
     * @return amount_  ABAF-adjusted aggregate held amount for `_tokenHolder`.
     */
    function getHeldAmountForAdjustedAt(
        address _tokenHolder,
        uint256 _timestamp
    ) internal view returns (uint256 amount_) {
        return
            getHeldAmountFor(_tokenHolder) *
            AdjustBalancesStorageWrapper.calculateFactorForHeldAmountByTokenHolderAdjustedAt(_tokenHolder, _timestamp);
    }

    /**
     * @notice Returns the per-partition held amount for a token holder scaled by the
     *         ABAF ratio at the given timestamp.
     * @dev    Applies `calculateFactor(abafAt(timestamp), labafByPartitionHeld)` to the
     *         raw partition held amount. Read-only projection; no state is mutated.
     * @param _partition    Partition to query.
     * @param _tokenHolder  Address to query.
     * @param _timestamp    Unix timestamp at which to evaluate the ABAF adjustment.
     * @return amount_  ABAF-adjusted held amount for `_tokenHolder` in `_partition`.
     */
    function getHeldAmountForByPartitionAdjustedAt(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _timestamp
    ) internal view returns (uint256 amount_) {
        return
            getHeldAmountForByPartition(_partition, _tokenHolder) *
            AdjustBalancesStorageWrapper.calculateFactor(
                AdjustBalancesStorageWrapper.getAbafAdjustedAt(_timestamp),
                AdjustBalancesStorageWrapper.getTotalHeldLabafByPartition(_partition, _tokenHolder)
            );
    }

    /**
     * @notice Reverts if the hold identifier does not refer to an active hold.
     * @dev    Delegates to `isHoldIdValid`. Reverts with `IHoldTypes.WrongHoldId` if
     *         the hold does not exist or has been fully consumed and removed.
     * @param _holdIdentifier  Identifier struct to validate.
     */
    function requireValidHoldId(IHoldTypes.HoldIdentifier memory _holdIdentifier) internal view {
        if (!isHoldIdValid(_holdIdentifier)) revert IHoldTypes.WrongHoldId();
    }

    /**
     * @notice Returns whether the hold identifier refers to an active hold.
     * @dev    A hold is active if and only if its stored `id` field is non-zero.
     *         Returns `false` for deleted or never-created holds.
     * @param _holdIdentifier  Identifier struct to check.
     * @return True if the hold exists and is active; false otherwise.
     */
    function isHoldIdValid(IHoldTypes.HoldIdentifier memory _holdIdentifier) internal view returns (bool) {
        return getHold(_holdIdentifier).id != 0;
    }

    /**
     * @notice Returns the full `HoldData` record for the specified hold.
     * @dev    Returns a zero-value struct if the hold does not exist. Callers should
     *         validate the hold ID via `requireValidHoldId` or `isHoldIdValid` before
     *         relying on the returned data.
     * @param _holdIdentifier  Identifier struct specifying the token holder, partition,
     *                         and hold ID.
     * @return Full `HoldData` struct for the specified hold; zero-value if absent.
     */
    function getHold(
        IHoldTypes.HoldIdentifier memory _holdIdentifier
    ) internal view returns (IHoldTypes.HoldData memory) {
        return
            holdStorage().holdsByAccountPartitionAndId[_holdIdentifier.tokenHolder][_holdIdentifier.partition][
                _holdIdentifier.holdId
            ];
    }

    /**
     * @notice Returns the raw aggregate held token amount for an address without ABAF
     *         adjustment.
     * @dev    Use `getHeldAmountForAdjustedAt` for a timestamp-adjusted view.
     * @param _tokenHolder  Address to query.
     * @return amount_  Raw aggregate held token quantity.
     */
    function getHeldAmountFor(address _tokenHolder) internal view returns (uint256 amount_) {
        return holdStorage().totalHeldAmountByAccount[_tokenHolder];
    }

    /**
     * @notice Returns the raw per-partition held token amount for an address without
     *         ABAF adjustment.
     * @dev    Use `getHeldAmountForByPartitionAdjustedAt` for a timestamp-adjusted view.
     * @param _partition    Partition to query.
     * @param _tokenHolder  Address to query.
     * @return amount_  Raw held token quantity for `_tokenHolder` in `_partition`.
     */
    function getHeldAmountForByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) internal view returns (uint256 amount_) {
        return holdStorage().totalHeldAmountByAccountAndPartition[_tokenHolder][_partition];
    }

    /**
     * @notice Returns a paginated slice of active hold IDs for a token holder under a
     *         specific partition.
     * @dev    Delegates to the `Pagination` library extension on
     *         `EnumerableSet.UintSet`. Enumeration order is not guaranteed to be stable
     *         across hold creations or removals. Returns an empty array if no active
     *         holds exist.
     * @param _partition    Partition to query.
     * @param _tokenHolder  Address to query.
     * @param _pageIndex    Zero-based page number to retrieve.
     * @param _pageLength   Maximum number of hold IDs to return per page.
     * @return holdsId_  Array of active hold IDs for the requested page.
     */
    function getHoldsIdForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (uint256[] memory holdsId_) {
        return holdStorage().holdIdsByAccountAndPartition[_tokenHolder][_partition].getFromSet(_pageIndex, _pageLength);
    }

    /**
     * @notice Returns the raw hold parameters for a specific hold without ABAF
     *         adjustment.
     * @dev    Unwraps the `HoldData` record into individual fields for external
     *         consumption. Returns zero-value fields if the hold does not exist.
     *         Use `getHoldForByPartitionAdjustedAt` for a timestamp-adjusted view of
     *         the amount.
     * @param _holdIdentifier  Identifier struct specifying the hold to retrieve.
     * @return amount_               Raw held token quantity.
     * @return expirationTimestamp_  Unix timestamp at which the hold expires.
     * @return escrow_               Address of the designated escrow.
     * @return destination_          Designated destination address for execution;
     *                               `address(0)` if unconstrained.
     * @return data_                 Arbitrary hold data payload.
     * @return operatorData_         Arbitrary operator data stored at creation.
     * @return thirdPartType_        Classification of the third party that created the
     *                               hold.
     */
    function getHoldForByPartition(
        IHoldTypes.HoldIdentifier memory _holdIdentifier
    )
        internal
        view
        returns (
            uint256 amount_,
            uint256 expirationTimestamp_,
            address escrow_,
            address destination_,
            bytes memory data_,
            bytes memory operatorData_,
            ThirdPartyType thirdPartType_
        )
    {
        IHoldTypes.HoldData memory holdData = getHold(_holdIdentifier);
        return (
            holdData.hold.amount,
            holdData.hold.expirationTimestamp,
            holdData.hold.escrow,
            holdData.hold.to,
            holdData.hold.data,
            holdData.operatorData,
            holdData.thirdPartyType
        );
    }

    /**
     * @notice Returns the hold parameters with the amount scaled by the ABAF ratio at
     *         the given timestamp.
     * @dev    Delegates to `getHoldForByPartition` for all fields, then applies
     *         `calculateFactor(abafAt(timestamp), holdLabafById)` to the amount field
     *         only. All other fields are returned as stored. Read-only projection.
     * @param _holdIdentifier  Identifier struct specifying the hold to retrieve.
     * @param _timestamp       Unix timestamp at which to evaluate the ABAF adjustment.
     * @return amount_               ABAF-adjusted held token quantity.
     * @return expirationTimestamp_  Unix timestamp at which the hold expires.
     * @return escrow_               Address of the designated escrow.
     * @return destination_          Designated destination address for execution.
     * @return data_                 Arbitrary hold data payload.
     * @return operatorData_         Arbitrary operator data stored at creation.
     * @return thirdPartType_        Classification of the third party.
     */
    function getHoldForByPartitionAdjustedAt(
        IHoldTypes.HoldIdentifier memory _holdIdentifier,
        uint256 _timestamp
    )
        internal
        view
        returns (
            uint256 amount_,
            uint256 expirationTimestamp_,
            address escrow_,
            address destination_,
            bytes memory data_,
            bytes memory operatorData_,
            ThirdPartyType thirdPartType_
        )
    {
        (
            amount_,
            expirationTimestamp_,
            escrow_,
            destination_,
            data_,
            operatorData_,
            thirdPartType_
        ) = getHoldForByPartition(_holdIdentifier);
        amount_ *= AdjustBalancesStorageWrapper.calculateFactor(
            AdjustBalancesStorageWrapper.getAbafAdjustedAt(_timestamp),
            AdjustBalancesStorageWrapper.getHoldLabafById(
                _holdIdentifier.partition,
                _holdIdentifier.tokenHolder,
                _holdIdentifier.holdId
            )
        );
    }

    /**
     * @notice Returns the third-party operator address associated with a specific hold.
     * @dev    Returns `address(0)` if no third party was registered or if the hold does
     *         not exist.
     * @param _holdIdentifier  Identifier struct specifying the hold to query.
     * @return thirdParty_  Address of the associated third-party operator.
     */
    function getHoldThirdParty(
        IHoldTypes.HoldIdentifier calldata _holdIdentifier
    ) internal view returns (address thirdParty_) {
        thirdParty_ = holdStorage().holdThirdPartyByAccountPartitionAndId[_holdIdentifier.tokenHolder][
            _holdIdentifier.partition
        ][_holdIdentifier.holdId];
    }

    /**
     * @notice Returns the number of active holds for a token holder under a specific
     *         partition.
     * @dev    Reads the length of the underlying `EnumerableSet.UintSet`; O(1) gas cost.
     *         Returns `0` if no active holds exist.
     * @param _partition    Partition to query.
     * @param _tokenHolder  Address to query.
     * @return Number of active holds for `_tokenHolder` in `_partition`.
     */
    function getHoldCountForByPartition(bytes32 _partition, address _tokenHolder) internal view returns (uint256) {
        return holdStorage().holdIdsByAccountAndPartition[_tokenHolder][_partition].length();
    }

    /**
     * @notice Returns whether a hold has passed its expiration timestamp.
     * @dev    Compares the current block timestamp from `TimeTravelStorageWrapper`
     *         against the hold's `expirationTimestamp`. A hold with
     *         `expirationTimestamp == 0` is never considered expired by this function.
     * @param _hold  Hold parameters struct to evaluate.
     * @return True if the current timestamp strictly exceeds `expirationTimestamp`;
     *         false otherwise.
     */
    function isHoldExpired(IHoldTypes.Hold memory _hold) internal view returns (bool) {
        return TimeTravelStorageWrapper.getBlockTimestamp() > _hold.expirationTimestamp;
    }

    /**
     * @notice Validates all preconditions for an operator-initiated hold creation,
     *         including the operator authorisation check.
     * @dev    Delegates all base checks to `checkCreateHoldFromByPartition`, then
     *         additionally verifies that `msg.sender` is an authorised operator for
     *         `_partition` on behalf of `_from` via `ERC1410StorageWrapper.requireOperator`.
     * @param _expirationTimestamp  Unix timestamp after which the hold expires.
     * @param _account              Address of the operator initiating the hold.
     * @param _to                   Designated destination address for execution.
     * @param _from                 Token holder whose balance is placed on hold.
     * @param _escrow               Escrow address designated to control the hold.
     * @param _partition            Partition under which the hold is created.
     */
    function checkOperatorCreateHoldByPartition(
        uint256 _expirationTimestamp,
        address _account,
        address _to,
        address _from,
        address _escrow,
        bytes32 _partition
    ) internal view {
        checkCreateHoldFromByPartition(_expirationTimestamp, _account, _to, _from, _escrow, _partition);
        ERC1410StorageWrapper.requireOperator(_partition, _from);
    }

    /**
     * @notice Validates all base preconditions for a hold creation by partition,
     *         excluding operator authorisation.
     * @dev    Enforces in order:
     *           1. `_expirationTimestamp` is a valid future timestamp.
     *           2. `_account`, `_to`, and `_from` are not recovered addresses.
     *           3. `_from` and `_escrow` are valid (non-zero) addresses.
     *           4. `_partition` matches the default partition in single-partition mode.
     *         Reverts with appropriate errors from each dependency on failure.
     * @param _expirationTimestamp  Unix timestamp after which the hold expires.
     * @param _account              Address of the party initiating the hold.
     * @param _to                   Designated destination address for execution.
     * @param _from                 Token holder whose balance is placed on hold.
     * @param _escrow               Escrow address designated to control the hold.
     * @param _partition            Partition under which the hold is created.
     */
    function checkCreateHoldFromByPartition(
        uint256 _expirationTimestamp,
        address _account,
        address _to,
        address _from,
        address _escrow,
        bytes32 _partition
    ) internal view {
        LockStorageWrapper.requireValidExpirationTimestamp(_expirationTimestamp);
        ERC3643StorageWrapper.requireUnrecoveredAddress(_account);
        ERC3643StorageWrapper.requireUnrecoveredAddress(_to);
        ERC3643StorageWrapper.requireUnrecoveredAddress(_from);
        ERC1410StorageWrapper.requireValidAddress(_from);
        ERC1410StorageWrapper.requireValidAddress(_escrow);
        ERC1410StorageWrapper.requireDefaultPartitionWithSinglePartition(_partition);
    }

    /**
     * @notice Returns the ABAF-adjusted held amount for a specific hold at the given
     *         timestamp.
     * @dev    Multiplies the raw hold amount by `calculateFactor(abafAt(timestamp),
     *         holdLabafById)`. Read-only projection; no state is mutated. Returns `0`
     *         if the hold does not exist.
     * @param _tokenHolder  Address that owns the hold.
     * @param _partition    Partition under which the hold was created.
     * @param _holdId       Hold ID to query.
     * @param _timestamp    Unix timestamp at which to evaluate the ABAF adjustment.
     * @return heldAmount_  ABAF-adjusted held token quantity for the specified hold.
     */
    function getHoldAdjustedAt(
        address _tokenHolder,
        bytes32 _partition,
        uint256 _holdId,
        uint256 _timestamp
    ) internal view returns (uint256 heldAmount_) {
        HoldDataStorage storage holdStorageRef = holdStorage();
        IHoldTypes.HoldData storage holdData = holdStorageRef.holdsByAccountPartitionAndId[_tokenHolder][_partition][
            _holdId
        ];
        heldAmount_ =
            holdData.hold.amount *
            AdjustBalancesStorageWrapper.calculateFactor(
                AdjustBalancesStorageWrapper.getAbafAdjustedAt(_timestamp),
                AdjustBalancesStorageWrapper.getHoldLabafById(_partition, _tokenHolder, _holdId)
            );
    }

    /**
     * @notice Returns whether the given address is the escrow designated in the hold.
     * @dev    Pure comparison; performs no storage reads.
     * @param _hold    Hold parameters struct to check against.
     * @param _escrow  Address to evaluate as the escrow candidate.
     * @return True if `_escrow` matches `_hold.escrow`; false otherwise.
     */
    function isEscrow(IHoldTypes.Hold memory _hold, address _escrow) internal pure returns (bool) {
        return _escrow == _hold.escrow;
    }

    /**
     * @notice Reverts if `_amount` exceeds the current hold amount.
     * @dev    Reverts with `IHoldTypes.InsufficientHoldBalance` on failure. Use as a
     *         guard before any partial hold operation to prevent arithmetic underflow
     *         downstream.
     * @param _amount    Token quantity requested by the operation.
     * @param holdData   In-memory hold data providing the current hold amount.
     */
    function checkHoldAmount(uint256 _amount, IHoldTypes.HoldData memory holdData) internal pure {
        if (_amount > holdData.hold.amount) revert IHoldTypes.InsufficientHoldBalance(holdData.hold.amount, _amount);
    }

    /**
     * @notice Restores the ERC20 allowance to the registered third-party operator for
     *         an `AUTHORIZED` hold, enabling the operator to re-use the returned
     *         balance.
     * @dev    No-ops immediately if `_thirdPartyType` is not `AUTHORIZED`. Reads the
     *         stored third-party address and calls `ERC20StorageWrapper
     *         .increaseAllowedBalance`. Must be called before the hold amount is
     *         decremented to prevent double-counting.
     * @param _thirdPartyType   Classification of the hold's third party.
     * @param _holdIdentifier   Identifier of the hold whose allowance is restored.
     * @param _amount           Token quantity to restore to the allowance.
     */
    function _restoreHoldAllowance(
        ThirdPartyType _thirdPartyType,
        IHoldTypes.HoldIdentifier calldata _holdIdentifier,
        uint256 _amount
    ) private {
        if (_thirdPartyType != ThirdPartyType.AUTHORIZED) return;
        ERC20StorageWrapper.increaseAllowedBalance(
            _holdIdentifier.tokenHolder,
            holdStorage().holdThirdPartyByAccountPartitionAndId[_holdIdentifier.tokenHolder][_holdIdentifier.partition][
                _holdIdentifier.holdId
            ],
            _amount
        );
    }

    /**
     * @notice Triggers all pending scheduled tasks and synchronises balance adjustments
     *         for the token holder before a hold is created.
     * @dev    Delegates to `ERC1410StorageWrapper.triggerAndSyncAll` with `address(0)`
     *         as the destination, as hold creation has no recipient. Must be called as
     *         the first step of hold creation to ensure ABAF consistency.
     * @param _partition  Partition under which the hold is being created.
     * @param _from       Token holder whose balance adjustments are synchronised.
     */
    function _prepareHoldCreation(bytes32 _partition, address _from) private {
        ERC1410StorageWrapper.triggerAndSyncAll(_partition, _from, address(0));
    }

    /**
     * @notice Persists a new hold record, registers it in the active set, increments
     *         the held amount accumulators, and records the hold-level ABAF.
     * @dev    Assigns a one-based hold ID via pre-increment of
     *         `nextHoldIdByAccountAndPartition`. Records `abaf` as the hold-level LABAF
     *         baseline so that future ABAF scaling can be computed correctly. Returns
     *         the assigned hold ID.
     * @param _partition      Partition under which the hold is stored.
     * @param _from           Token holder that owns the hold.
     * @param _hold           Hold parameters to persist.
     * @param _operatorData   Operator data to store with the hold.
     * @param _thirdPartyType Classification of the third party.
     * @param abaf            Current ABAF value at the time of hold creation, stored as
     *                        the hold-level LABAF baseline.
     * @return holdId_  One-based hold ID assigned to the newly created hold.
     */
    function _storeHold(
        bytes32 _partition,
        address _from,
        IHoldTypes.Hold memory _hold,
        bytes memory _operatorData,
        ThirdPartyType _thirdPartyType,
        uint256 abaf
    ) private returns (uint256 holdId_) {
        HoldDataStorage storage holdStorageRef = holdStorage();
        holdId_ = ++holdStorageRef.nextHoldIdByAccountAndPartition[_from][_partition];
        IHoldTypes.HoldData memory hold = IHoldTypes.HoldData(holdId_, _hold, _operatorData, _thirdPartyType);
        AdjustBalancesStorageWrapper.setHeldLabafById(_partition, _from, holdId_, abaf);
        holdStorageRef.holdsByAccountPartitionAndId[_from][_partition][holdId_] = hold;
        holdStorageRef.holdIdsByAccountAndPartition[_from][_partition].add(holdId_);
        holdStorageRef.totalHeldAmountByAccountAndPartition[_from][_partition] += _hold.amount;
        holdStorageRef.totalHeldAmountByAccount[_from] += _hold.amount;
    }

    /**
     * @notice Emits `IERC1410Types.TransferByPartition` and `IERC20.Transfer` to
     *         `address(0)` to signal that tokens have been placed on hold and removed
     *         from the spendable supply.
     * @dev    `TransferByPartition` uses `address(0)` as the destination. `IERC20
     *         .Transfer` is emitted from `_from` to `address(0)` for ERC20 indexer
     *         compatibility.
     * @param _partition     Partition under which the hold was created.
     * @param _from          Token holder whose tokens were placed on hold.
     * @param amount         Token quantity placed on hold.
     * @param _operatorData  Operator data passed through to the event.
     */
    function _emitHoldCreationEvents(
        bytes32 _partition,
        address _from,
        uint256 amount,
        bytes memory _operatorData
    ) private {
        emit IERC1410Types.TransferByPartition(
            _partition,
            EvmAccessors.getMsgSender(),
            _from,
            address(0),
            amount,
            _operatorData,
            ""
        );
        emit IERC20.Transfer(_from, address(0), amount);
    }

    /**
     * @notice Decrements the hold amount by `_amount` and removes the hold record
     *         entirely if the remaining balance reaches zero.
     * @dev    Delegates to `decreaseHeldAmount` first. If the returned new balance is
     *         zero, delegates to `removeHold` to clean up all associated storage.
     * @param _holdIdentifier  Struct identifying the hold to decrement or remove.
     * @param _amount          Token quantity to deduct.
     */
    function _decreaseOrRemoveHold(IHoldTypes.HoldIdentifier calldata _holdIdentifier, uint256 _amount) private {
        if (decreaseHeldAmount(_holdIdentifier, _amount) == 0) {
            removeHold(_holdIdentifier);
        }
    }

    /**
     * @notice Transfers the held balance to `_to` by adding it to an existing partition
     *         or creating a new partition entry.
     * @dev    If `_to` already holds a position in the partition, increments it via
     *         `increaseBalanceByPartition`. Otherwise creates a new partition entry via
     *         `addPartitionTo`. Must only be called after the held amount accumulators
     *         have been decremented.
     * @param _holdIdentifier  Struct identifying the partition and token holder.
     * @param _to              Destination address to receive the balance.
     * @param _amount          Token quantity to transfer.
     */
    function _transferHoldBalance(
        IHoldTypes.HoldIdentifier calldata _holdIdentifier,
        address _to,
        uint256 _amount
    ) private {
        if (ERC1410StorageWrapper.validPartitionForReceiver(_holdIdentifier.partition, _to)) {
            ERC1410StorageWrapper.increaseBalanceByPartition(_to, _amount, _holdIdentifier.partition);
            return;
        }
        ERC1410StorageWrapper.addPartitionTo(_amount, _to, _holdIdentifier.partition);
    }

    /**
     * @notice Calls `ICompliance.transferred` on the compliance module if the hold
     *         execution represents a default-partition transfer between distinct
     *         addresses.
     * @dev    Skips the call if the destination equals the token holder (release/reclaim
     *         paths) or if the partition is not `_DEFAULT_PARTITION`. Reverts with
     *         `IERC3643Types.ComplianceCallFailed` if the compliance call fails.
     * @param _holdIdentifier  Struct identifying the token holder, partition, and hold ID.
     * @param _to              Destination address that received the tokens.
     * @param _amount          Token quantity transferred.
     */
    function _notifyTransferComplianceIfNeeded(
        IHoldTypes.HoldIdentifier calldata _holdIdentifier,
        address _to,
        uint256 _amount
    ) private {
        if (_holdIdentifier.tokenHolder == _to || _holdIdentifier.partition != _DEFAULT_PARTITION) return;
        ERC3643StorageWrapper.getCompliance().functionCall(
            abi.encodeWithSelector(ICompliance.transferred.selector, _holdIdentifier.tokenHolder, _to, _amount),
            IERC3643Types.ComplianceCallFailed.selector
        );
    }

    /**
     * @notice Emits `IERC1410Types.TransferByPartition` from `address(0)` and
     *         `IERC20.Transfer` from `address(0)` to signal that held tokens have been
     *         transferred to the destination.
     * @dev    Both events use `address(0)` as the source to indicate tokens returning
     *         from the held state to the spendable supply.
     * @param _holdIdentifier  Struct identifying the partition and hold context.
     * @param _to              Destination address that received the tokens.
     * @param _amount          Token quantity transferred.
     */
    function _emitHoldTransfer(
        IHoldTypes.HoldIdentifier calldata _holdIdentifier,
        address _to,
        uint256 _amount
    ) private {
        emit IERC1410Types.TransferByPartition(
            _holdIdentifier.partition,
            EvmAccessors.getMsgSender(),
            address(0),
            _to,
            _amount,
            "",
            ""
        );
        emit IERC20.Transfer(address(0), _to, _amount);
    }

    /**
     * @notice Dispatches hold operation validation to the appropriate private validator
     *         based on the operation type.
     * @dev    Execute → `_validateExecuteHold`; Reclaim → `_validateReclaimHold`;
     *         Release → `_validateNonReclaimHold`. Each validator may revert with
     *         operation-specific errors.
     * @param _holdIdentifier  Struct identifying the hold being operated on.
     * @param holdData         In-memory snapshot of the hold record.
     * @param _to              Destination address used in execute validation.
     * @param _operation       Operation type determining which validator is invoked.
     */
    function _validateHoldOperation(
        IHoldTypes.HoldIdentifier calldata _holdIdentifier,
        IHoldTypes.HoldData memory holdData,
        address _to,
        IHoldTypes.OperationType _operation
    ) private view {
        if (_operation == IHoldTypes.OperationType.Execute) {
            _validateExecuteHold(_holdIdentifier, holdData, _to);
            return;
        }
        if (_operation == IHoldTypes.OperationType.Reclaim) {
            _validateReclaimHold(holdData);
            return;
        }
        _validateNonReclaimHold(holdData);
    }

    /**
     * @notice Validates the preconditions for a hold execution operation.
     * @dev    Reverts with:
     *           - `ICommonErrors.AccountIsBlocked` if the token holder fails the
     *             control list check.
     *           - `IHoldTypes.InvalidDestinationAddress` if `_to` does not match the
     *             hold's designated destination (when non-zero).
     *           - `IHoldTypes.HoldExpirationReached` if the hold has expired.
     *           - `IHoldTypes.IsNotEscrow` if `msg.sender` is not the designated escrow.
     * @param _holdIdentifier  Struct identifying the hold.
     * @param holdData         In-memory hold record.
     * @param _to              Destination address provided by the caller.
     */
    function _validateExecuteHold(
        IHoldTypes.HoldIdentifier calldata _holdIdentifier,
        IHoldTypes.HoldData memory holdData,
        address _to
    ) private view {
        if (!ControlListStorageWrapper.isAbleToAccess(_holdIdentifier.tokenHolder)) {
            revert ICommonErrors.AccountIsBlocked(_holdIdentifier.tokenHolder);
        }
        if (holdData.hold.to != address(0) && _to != holdData.hold.to) {
            revert IHoldTypes.InvalidDestinationAddress(holdData.hold.to, _to);
        }
        if (isHoldExpired(holdData.hold)) {
            revert IHoldTypes.HoldExpirationReached();
        }
        if (!isEscrow(holdData.hold, EvmAccessors.getMsgSender())) {
            revert IHoldTypes.IsNotEscrow();
        }
    }

    /**
     * @notice Validates that a hold has expired, as required for a reclaim operation.
     * @dev    Reverts with `IHoldTypes.HoldExpirationNotReached` if the hold is still
     *         active (i.e. not yet expired).
     * @param holdData  In-memory hold record to evaluate.
     */
    function _validateReclaimHold(IHoldTypes.HoldData memory holdData) private view {
        if (!isHoldExpired(holdData.hold)) {
            revert IHoldTypes.HoldExpirationNotReached();
        }
    }

    /**
     * @notice Validates the preconditions for a non-reclaim hold operation (i.e.
     *         release).
     * @dev    Reverts with `IHoldTypes.HoldExpirationReached` if the hold has expired,
     *         or `IHoldTypes.IsNotEscrow` if `msg.sender` is not the designated escrow.
     * @param holdData  In-memory hold record to evaluate.
     */
    function _validateNonReclaimHold(IHoldTypes.HoldData memory holdData) private view {
        if (isHoldExpired(holdData.hold)) {
            revert IHoldTypes.HoldExpirationReached();
        }
        if (!isEscrow(holdData.hold, EvmAccessors.getMsgSender())) {
            revert IHoldTypes.IsNotEscrow();
        }
    }

    /**
     * @notice Returns the Diamond Storage pointer for `HoldDataStorage`.
     * @dev    Uses inline assembly to position the struct at the deterministic slot
     *         defined by `_HOLD_STORAGE_POSITION`, following the ERC-2535 Diamond
     *         Storage Pattern. Slot isolation prevents collisions with other facet
     *         storage structs in the same proxy. Must only be called from within this
     *         library.
     * @return hold_  Storage pointer to the `HoldDataStorage` struct.
     */
    function holdStorage() private pure returns (HoldDataStorage storage hold_) {
        bytes32 position = _HOLD_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            hold_.slot := position
        }
    }
}
