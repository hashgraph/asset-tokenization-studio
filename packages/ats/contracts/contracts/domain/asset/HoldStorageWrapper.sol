// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { Pagination } from "../../infrastructure/utils/Pagination.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { IHoldTypes } from "../../facets/hold/IHoldTypes.sol";
import { ICompliance } from "../../facets/compliance/externalInterfaces/ICompliance.sol";
import { IERC3643Types } from "../../facets/commonTypes/IERC3643Types.sol";
import { ERC20StorageWrapper } from "./ERC20StorageWrapper.sol";
import { IERC1410Types } from "../../facets/commonTypes/IERC1410Types.sol";
import { ThirdPartyType } from "./types/ThirdPartyType.sol";
import { LowLevelCall } from "../../infrastructure/utils/LowLevelCall.sol";
import { _checkNonceAndDeadline } from "../../infrastructure/utils/EIP712.sol";
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
import { DefaultValueValidation } from "../../infrastructure/utils/DefaultValueValidation.sol";

/// @custom:hash storage Hold
bytes32 constant STORAGE_LOCATION_HOLD = 0xaee7bac248b1ceeb630aa06b36647d058252989965cf9b4a02eac9b8aec67000;

/**
 * @notice ERC-7201 namespaced storage layout for hold-related state.
 * @dev Tracks per-account and per-partition held balances alongside individual hold records
 *      keyed by `(account, partition, holdId)`. New fields land below the append-only marker
 *      to preserve slot stability across upgrades.
 * @custom:storage-location erc7201:security.token.standard.storage.Hold
 */
struct HoldDataStorage {
    // ─── R1 Lifecycle (bool flags) ───────────────────────────
    // ─── R2 Packed scalars (uint8, bytes3, address, enum) ────
    // ─── R3 Single-slot scalars (uint256, bytes32, string) ───
    // ─── R4 Aggregates (mapping, array, EnumerableSet) ───────
    mapping(address => uint256) totalHeldAmountByAccount;
    mapping(address => mapping(bytes32 => uint256)) totalHeldAmountByAccountAndPartition;
    mapping(address => mapping(bytes32 => mapping(uint256 => IHoldTypes.HoldData))) holdsByAccountPartitionAndId;
    mapping(address => mapping(bytes32 => EnumerableSet.UintSet)) holdIdsByAccountAndPartition;
    mapping(address => mapping(bytes32 => uint256)) nextHoldIdByAccountAndPartition;
    mapping(address => mapping(bytes32 => mapping(uint256 => address))) holdThirdPartyByAccountPartitionAndId;
    // ─── APPEND-ONLY ZONE BELOW ───
}

/**
 * @title HoldStorageWrapper
 * @notice Storage wrapper for hold management operations
 * @dev Manages hold data storage including holds by account, partition, and hold ID
 * @author Hashgraph
 */
library HoldStorageWrapper {
    using Pagination for EnumerableSet.UintSet;
    using EnumerableSet for EnumerableSet.UintSet;
    using LowLevelCall for address;

    /**
     * @notice Creates a new hold for `_from` on `_partition` and assigns it a fresh hold id.
     * @dev Reduces the available partition balance by `_hold.amount`, persists the hold record
     *      and emits the partition-transfer events that signal the freeze. The caller is
     *      responsible for any role gating; this helper enforces only non-zero amount and
     *      storage-level invariants.
     * @param _partition The partition under which the hold is created.
     * @param _from The token holder whose balance is reduced and held.
     * @param _hold The hold parameters (amount, expiration, escrow, destination, data).
     * @param _operatorData Additional operator-supplied data forwarded into emitted events.
     * @param _thirdPartyType Classification of the caller (NULL, AUTHORISED, OPERATOR or
     *                       PROTECTED) used by release/reclaim flows to restore allowances.
     * @return success_ Always `true` on completion; reverts on failure.
     * @return holdId_ The newly assigned identifier for the hold.
     */
    function createHoldByPartition(
        bytes32 _partition,
        address _from,
        IHoldTypes.Hold memory _hold,
        bytes memory _operatorData,
        ThirdPartyType _thirdPartyType
    ) internal returns (bool success_, uint256 holdId_) {
        checkNonZeroHoldAmount(_hold.amount);

        _prepareHoldCreation(_partition, _from);

        uint256 abaf = updateTotalHold(_partition, _from);

        beforeHold(_partition, _from);
        ERC1410StorageWrapper.reducePartitionOnly(_from, _hold.amount, _partition);

        holdId_ = _storeHold(_partition, _from, _hold, _operatorData, _thirdPartyType, abaf);

        _emitHoldCreationEvents(_partition, _from, _hold.amount, _operatorData);

        return (true, holdId_);
    }

    /**
     * @notice Creates a hold on behalf of `_from` using an EIP-712 signature authorising the
     *         operation.
     * @dev Validates the nonce and deadline, verifies the signature against the protected
     *      partitions module, consumes the holder's nonce and then delegates to
     *      `createHoldByPartition` with `ThirdPartyType.PROTECTED`.
     * @param _partition The partition under which the hold is created.
     * @param _from The token holder authorising the protected hold via signature.
     * @param _protectedHold The signed hold payload (hold parameters, nonce and deadline).
     * @param _signature The EIP-712 signature produced by `_from`.
     * @return success_ Always `true` on completion; reverts on failure.
     * @return holdId_ The newly assigned identifier for the hold.
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

        NonceStorageWrapper.setNonceFor(_from);

        return createHoldByPartition(_partition, _from, _protectedHold.hold, "", ThirdPartyType.PROTECTED);
    }

    /**
     * @notice Records the caller as the authorised third party for a hold and decrements the
     *         ERC-20 allowance they spent to open it.
     * @dev Used by authorised (allowance-based) hold creation flows so that release and
     *      reclaim can restore the original allowance.
     * @param _partition The partition under which the hold lives.
     * @param _from The token holder whose allowance is being consumed.
     * @param _amount The allowance amount to decrement.
     * @param _holdId The identifier of the hold being attributed to the caller.
     */
    function decreaseAllowedBalanceForHold(
        bytes32 _partition,
        address _from,
        uint256 _amount,
        uint256 _holdId
    ) internal {
        address thirdPartyAddress = EvmAccessors.getMsgSender();
        ERC20StorageWrapper.decreaseAllowedBalance(_from, thirdPartyAddress, _amount);
        setThirdPartyForHold(thirdPartyAddress, _partition, _from, _holdId);
    }

    /**
     * @notice Records the third party associated with a given hold.
     * @dev Stores `_thirdPartyAddress` in the per-hold lookup so later release / reclaim flows
     *      can restore the ERC-20 allowance to the correct address.
     * @param _thirdPartyAddress The address attributed as the hold's third party.
     * @param _partition The partition under which the hold lives.
     * @param _from The token holder owning the hold.
     * @param _holdId The identifier of the hold.
     */
    function setThirdPartyForHold(
        address _thirdPartyAddress,
        bytes32 _partition,
        address _from,
        uint256 _holdId
    ) internal {
        holdStorage().holdThirdPartyByAccountPartitionAndId[_from][_partition][_holdId] = _thirdPartyAddress;
    }

    /**
     * @notice Overwrites the total held amount for a token holder on a specific partition.
     * @dev Writes directly to `totalHeldAmountByAccountAndPartition[_tokenHolder][_partition]`;
     *      callers are responsible for ensuring the new value is consistent with the individual
     *      holds tracked elsewhere in storage.
     * @param _partition  Partition whose held-amount counter is updated.
     * @param _tokenHolder Account whose held balance is set.
     * @param _amount      New total held amount; replaces the previous value unconditionally.
     */
    function setHeldAmountForByPartition(bytes32 _partition, address _tokenHolder, uint256 _amount) internal {
        holdStorage().totalHeldAmountByAccountAndPartition[_tokenHolder][_partition] = _amount;
    }

    /**
     * @notice Overwrites the total held amount for a token holder across all partitions.
     * @dev Writes directly to `totalHeldAmountByAccount[_tokenHolder]`; callers are
     *      responsible for ensuring the new value is consistent with the individual holds
     *      tracked elsewhere in storage.
     * @param _tokenHolder Account whose aggregate held balance is set.
     * @param _amount      New aggregate held amount; replaces the previous value unconditionally.
     */
    function setHeldAmountFor(address _tokenHolder, uint256 _amount) internal {
        holdStorage().totalHeldAmountByAccount[_tokenHolder] = _amount;
    }

    /**
     * @notice Executes a hold by transferring `_amount` of the held tokens to `_to`.
     * @dev Updates the security-holder bookkeeping, runs the generic hold operation and, when
     *      the underlying hold balance is drained, removes its adjustment factor tracking.
     * @param _holdIdentifier The triple (partition, tokenHolder, holdId) identifying the hold.
     * @param _to The destination address receiving the released tokens.
     * @param _amount The amount to execute against the hold.
     * @return success_ Always `true` on completion; reverts on failure.
     * @return partition_ The partition of the executed hold (for caller convenience).
     */
    function executeHoldByPartition(
        IHoldTypes.HoldIdentifier calldata _holdIdentifier,
        address _to,
        uint256 _amount
    ) internal returns (bool success_, bytes32 partition_) {
        beforeExecuteHold(_holdIdentifier, _to);

        ERC1410StorageWrapper.updateSecurityHolder(_holdIdentifier.tokenHolder, _to, _amount);

        success_ = operateHoldByPartition(_holdIdentifier, _to, _amount, IHoldTypes.OperationType.Execute);
        partition_ = _holdIdentifier.partition;
    }

    /**
     * @notice Releases `_amount` from a hold back to the original token holder.
     * @dev Restores any consumed ERC-20 allowance for `AUTHORIZED` holds, performs the hold
     *      operation against the holder and removes the adjustment-factor tracking once the
     *      hold is fully released.
     * @param _holdIdentifier The triple (partition, tokenHolder, holdId) identifying the hold.
     * @param _amount The amount to release from the hold.
     * @return success_ Always `true` on completion; reverts on failure.
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
    }

    /**
     * @notice Reclaims an expired hold in full back to the token holder.
     * @dev Requires the hold to be past its expiration timestamp; restores any consumed
     *      ERC-20 allowance for `AUTHORIZED` holds and removes the adjustment-factor entry
     *      after reclamation.
     * @param _holdIdentifier The triple (partition, tokenHolder, holdId) identifying the hold.
     * @return success_ Always `true` on completion; reverts on failure.
     * @return amount_ The full amount that was reclaimed from the hold.
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
    }

    /**
     * @notice Shared dispatch entry point for execute / release / reclaim flows.
     * @dev Validates the requested operation against the stored hold state, ensures the
     *      requested amount is within bounds and then performs the underlying transfer.
     * @param _holdIdentifier The triple (partition, tokenHolder, holdId) identifying the hold.
     * @param _to The destination address (token holder for release/reclaim, escrow target for
     *           execute).
     * @param _amount The amount to operate against the hold.
     * @param _operation The variant of the operation (Execute, Release or Reclaim).
     * @return success_ Always `true` on completion; reverts on failure.
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
     * @notice Transfers `_amount` from the hold to `_to`, drawing down the hold balance.
     * @dev Decreases or removes the hold record, credits the destination partition balance,
     *      notifies compliance if the holder and destination differ and emits the
     *      partition-transfer events. Used by execute / release / reclaim alike.
     * @param _holdIdentifier The triple (partition, tokenHolder, holdId) identifying the hold.
     * @param _to The destination address receiving the transferred amount.
     * @param _amount The amount being transferred out of the hold.
     */
    function transferHold(IHoldTypes.HoldIdentifier calldata _holdIdentifier, address _to, uint256 _amount) internal {
        _decreaseOrRemoveHold(_holdIdentifier, _amount);

        _transferHoldBalance(_holdIdentifier, _to, _amount);

        _notifyTransferComplianceIfNeeded(_holdIdentifier, _to, _amount);

        _emitHoldTransfer(_holdIdentifier, _to, _amount);

        ERC1410StorageWrapper.afterTokenTransfer(_holdIdentifier.partition, _holdIdentifier.tokenHolder, _to, _amount);
    }

    /**
     * @notice Decrements the per-account, per-partition and per-hold tallies by `_amount`.
     * @dev Caller must guarantee `_amount` is within the hold's current balance; underflow
     *      would otherwise revert.
     * @param _holdIdentifier The triple (partition, tokenHolder, holdId) identifying the hold.
     * @param _amount The amount to subtract from each held-amount counter.
     * @return newHoldBalance_ The hold's remaining balance after the decrement.
     */
    function decreaseHeldAmount(
        IHoldTypes.HoldIdentifier memory _holdIdentifier,
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
     * @notice Removes a hold record and all related bookkeeping for a token holder.
     * @dev Drops the hold id from the per-account `EnumerableSet`, deletes the hold and
     *      third-party mappings and clears the adjustment-factor entry for the hold.
     * @param _holdIdentifier The triple (partition, tokenHolder, holdId) identifying the hold.
     */
    function removeHold(IHoldTypes.HoldIdentifier memory _holdIdentifier) internal {
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
     * @notice Synchronises a holder's aggregate held amounts with the current balance
     *         adjustment factor (ABAF).
     * @dev Compares the global ABAF against the holder's last-applied factors (overall and
     *      per-partition) and applies a rebase to bring them into line. Returns the current
     *      ABAF so callers can avoid a second SLOAD.
     * @param _partition The partition to synchronise.
     * @param _tokenHolder The holder whose held totals are updated.
     * @return abaf_ The current ABAF in effect after the synchronisation.
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
     * @notice Rebases the holder's aggregate held amount by `_factor` and records `_abaf` as
     *         the last-applied balance adjustment factor.
     * @dev Multiplies the stored total in-place; callers must pass a factor consistent with
     *      the current ABAF to avoid drift between the per-account and per-partition tallies.
     * @param _tokenHolder The holder whose aggregate held amount is being rebased.
     * @param _factor The multiplier to apply to the stored total.
     * @param _abaf The ABAF value to record as the new last-applied factor.
     */
    function updateTotalHeldAmountAndLabaf(address _tokenHolder, uint256 _factor, uint256 _abaf) internal {
        holdStorage().totalHeldAmountByAccount[_tokenHolder] *= _factor;
        AdjustBalancesStorageWrapper.setTotalHeldLabaf(_tokenHolder, _abaf);
    }

    /**
     * @notice Rebases the holder's per-partition held amount by `_factor` and records `_abaf`
     *         as the last-applied factor for that partition.
     * @dev Mirrors `updateTotalHeldAmountAndLabaf` for the per-partition tally.
     * @param _partition The partition being rebased.
     * @param _tokenHolder The holder whose per-partition held amount is being rebased.
     * @param _factor The multiplier to apply to the stored total.
     * @param _abaf The ABAF value to record as the new last-applied factor for the partition.
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
     * @notice Triggers and synchronises adjustment factors across the holder, destination and
     *         the targeted hold.
     * @dev Ensures held balances and per-hold amounts reflect the current ABAF before a
     *      mutation. Used as a guard step ahead of execute / release / reclaim flows.
     * @param _holdIdentifier The triple (partition, tokenHolder, holdId) identifying the hold.
     * @param _to The destination address whose synchronisation is also triggered.
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
     * @notice Synchronises an individual hold's amount with the current ABAF.
     * @dev Short-circuits when the per-hold last-applied factor already matches `_abaf`,
     *      otherwise applies the calculated rebase factor and updates the stored marker.
     * @param _partition The partition under which the hold lives.
     * @param _holdId The identifier of the hold to update.
     * @param _tokenHolder The holder owning the hold.
     * @param _abaf The current ABAF to align the hold to.
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
     * @notice Rebases an individual hold's stored amount by `_factor`.
     * @dev Direct multiplication on the stored amount; callers must pass a factor derived
     *      from the ABAF / last-applied factor pair.
     * @param _partition The partition under which the hold lives.
     * @param _holdId The identifier of the hold being rebased.
     * @param _tokenHolder The holder owning the hold.
     * @param _factor The multiplier to apply to the stored amount.
     */
    function updateHoldAmountById(bytes32 _partition, uint256 _holdId, address _tokenHolder, uint256 _factor) internal {
        holdStorage().holdsByAccountPartitionAndId[_tokenHolder][_partition][_holdId].hold.amount *= _factor;
    }

    /**
     * @notice Snapshots the holder's account and held balances ahead of a new hold creation.
     * @dev Invoked from `createHoldByPartition` to capture state before the balance moves
     *      into the hold record.
     * @param _partition The partition snapshot to advance.
     * @param _tokenHolder The holder whose snapshots are being captured.
     */
    function beforeHold(bytes32 _partition, address _tokenHolder) internal {
        SnapshotsStorageWrapper.updateAccountSnapshot(_tokenHolder, _partition);
        SnapshotsStorageWrapper.updateAccountHeldBalancesSnapshot(_tokenHolder, _partition);
    }

    /**
     * @notice Prepares storage ahead of a hold execution: ABAF sync plus account snapshots.
     * @dev Syncs both the holder's and destination's adjustment factors, then captures their
     *      account and held-balances snapshots so historical queries remain accurate.
     * @param _holdIdentifier The triple (partition, tokenHolder, holdId) identifying the hold.
     * @param _to The destination address that will receive the executed amount.
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
     * @notice Prepares storage ahead of a hold release; convenience alias for `beforeExecuteHold`
     *         targeting the token holder.
     * @dev Releases return tokens to the original holder, so the destination collapses onto
     *      `_holdIdentifier.tokenHolder`.
     * @param _holdIdentifier The triple (partition, tokenHolder, holdId) identifying the hold.
     */
    function beforeReleaseHold(IHoldTypes.HoldIdentifier calldata _holdIdentifier) internal {
        beforeExecuteHold(_holdIdentifier, _holdIdentifier.tokenHolder);
    }

    /**
     * @notice Prepares storage ahead of a hold reclaim; convenience alias for
     *         `beforeExecuteHold` targeting the token holder.
     * @dev Reclaims return tokens to the original holder, so the destination collapses onto
     *      `_holdIdentifier.tokenHolder`.
     * @param _holdIdentifier The triple (partition, tokenHolder, holdId) identifying the hold.
     */
    function beforeReclaimHold(IHoldTypes.HoldIdentifier calldata _holdIdentifier) internal {
        beforeExecuteHold(_holdIdentifier, _holdIdentifier.tokenHolder);
    }

    /**
     * @notice Returns the holder's aggregate held amount adjusted to `_timestamp`.
     * @dev Multiplies the current stored total by the historical balance adjustment factor
     *      effective at `_timestamp`, derived from the snapshot module.
     * @param _tokenHolder The holder being queried.
     * @param _timestamp The historical timestamp to align the amount with.
     * @return amount_ The adjusted aggregate held amount at `_timestamp`.
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
     * @notice Returns the holder's held amount on `_partition` adjusted to `_timestamp`.
     * @dev Composes the current partition-level held amount with the historical adjustment
     *      factor for that partition at `_timestamp`.
     * @param _partition The partition being queried.
     * @param _tokenHolder The holder being queried.
     * @param _timestamp The historical timestamp to align the amount with.
     * @return amount_ The adjusted per-partition held amount at `_timestamp`.
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
     * @notice Reverts with `WrongHoldId` when `_holdIdentifier` does not match a stored hold.
     * @dev Inverse guard built on top of `isHoldIdValid`.
     * @param _holdIdentifier The triple (partition, tokenHolder, holdId) being validated.
     */
    function requireValidHoldId(IHoldTypes.HoldIdentifier calldata _holdIdentifier) internal view {
        if (!isHoldIdValid(_holdIdentifier)) revert IHoldTypes.WrongHoldId();
    }

    /**
     * @notice Returns whether `_holdIdentifier` refers to an existing stored hold.
     * @dev Existence is determined by checking that the stored hold's `id` field is non-zero
     *      (hold ids are assigned monotonically from one).
     * @param _holdIdentifier The triple (partition, tokenHolder, holdId) being checked.
     * @return Whether the hold exists in storage.
     */
    function isHoldIdValid(IHoldTypes.HoldIdentifier calldata _holdIdentifier) internal view returns (bool) {
        return getHold(_holdIdentifier).id != 0;
    }

    /**
     * @notice Returns the full `HoldData` record for `_holdIdentifier`.
     * @dev Returns a zero-valued struct when the hold is absent; callers wanting existence
     *      semantics should pair this with `isHoldIdValid` / `requireValidHoldId`.
     * @param _holdIdentifier The triple (partition, tokenHolder, holdId) to load.
     * @return data_ The stored hold record.
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
     * @notice Returns the holder's aggregate held amount across all partitions.
     * @param _tokenHolder The holder being queried.
     * @return amount_ The current aggregate held amount.
     */
    function getHeldAmountFor(address _tokenHolder) internal view returns (uint256) {
        return holdStorage().totalHeldAmountByAccount[_tokenHolder];
    }

    /**
     * @notice Returns the holder's held amount on a specific partition.
     * @param _partition The partition being queried.
     * @param _tokenHolder The holder being queried.
     * @return amount_ The current per-partition held amount.
     */
    function getHeldAmountForByPartition(bytes32 _partition, address _tokenHolder) internal view returns (uint256) {
        return holdStorage().totalHeldAmountByAccountAndPartition[_tokenHolder][_partition];
    }

    /**
     * @notice Returns a paginated slice of hold ids for `_tokenHolder` on `_partition`.
     * @dev Pagination is delegated to the `Pagination` library to keep gas bounded.
     * @param _partition The partition whose hold ids are listed.
     * @param _tokenHolder The holder whose hold ids are listed.
     * @param _pageIndex The zero-based page index to read.
     * @param _pageLength The maximum number of ids returned in the page.
     * @return holdsId_ The hold ids contained in the requested page.
     */
    function getHoldsIdForByPartition(
        bytes32 _partition,
        address _tokenHolder,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (uint256[] memory) {
        return holdStorage().holdIdsByAccountAndPartition[_tokenHolder][_partition].getFromSet(_pageIndex, _pageLength);
    }

    /**
     * @notice Returns the full array of hold ids for `_tokenHolder` on `_partition`.
     * @dev Use with caution; unbounded array reads can cause OOG errors. Prefer
     *      `getHoldsIdForByPartition` with pagination for external callers.
     * @param _tokenHolder The holder whose hold ids are listed.
     * @param _partition The partition whose hold ids are listed.
     * @return holdsId_ The full array of hold ids for the specified holder and partition.
     */
    function getHoldsIdByAccountAndPartition(
        address _tokenHolder,
        bytes32 _partition
    ) internal view returns (EnumerableSet.UintSet storage) {
        return holdStorage().holdIdsByAccountAndPartition[_tokenHolder][_partition];
    }

    /**
     * @notice Returns the destructured fields of a single hold record.
     * @dev Convenience over `getHold` for external callers that prefer a tuple to a struct.
     * @param _holdIdentifier The triple (partition, tokenHolder, holdId) to load.
     * @return amount_ The held amount.
     * @return expirationTimestamp_ The hold's expiration timestamp.
     * @return escrow_ The address authorised to execute the hold.
     * @return destination_ The destination address (zero when unconstrained).
     * @return data_ Arbitrary caller-supplied data attached at creation.
     * @return operatorData_ Arbitrary operator-supplied data attached at creation.
     * @return thirdPartType_ The third-party classification recorded at creation.
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
     * @notice Returns the destructured fields of a hold, with the amount rebased to
     *         `_timestamp`.
     * @dev Identical to `getHoldForByPartition` save for the historical ABAF multiplier
     *      applied to `amount_`.
     * @param _holdIdentifier The triple (partition, tokenHolder, holdId) to load.
     * @param _timestamp The historical timestamp the amount is aligned to.
     * @return amount_ The held amount rebased to `_timestamp`.
     * @return expirationTimestamp_ The hold's expiration timestamp.
     * @return escrow_ The address authorised to execute the hold.
     * @return destination_ The destination address (zero when unconstrained).
     * @return data_ Arbitrary caller-supplied data attached at creation.
     * @return operatorData_ Arbitrary operator-supplied data attached at creation.
     * @return thirdPartType_ The third-party classification recorded at creation.
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
     * @notice Returns the third party recorded against a given hold.
     * @dev Returns the zero address when no third party was set (typical for non-authorised
     *      hold creation paths).
     * @param _holdIdentifier The triple (partition, tokenHolder, holdId) to query.
     * @return thirdParty_ The stored third-party address for the hold.
     */
    function getHoldThirdParty(IHoldTypes.HoldIdentifier memory _holdIdentifier) internal view returns (address) {
        return
            holdStorage().holdThirdPartyByAccountPartitionAndId[_holdIdentifier.tokenHolder][_holdIdentifier.partition][
                _holdIdentifier.holdId
            ];
    }

    /**
     * @notice Returns the number of active holds a holder has on a specific partition.
     * @param _partition The partition being queried.
     * @param _tokenHolder The holder being queried.
     * @return The count of stored hold ids.
     */
    function getHoldCountForByPartition(bytes32 _partition, address _tokenHolder) internal view returns (uint256) {
        return holdStorage().holdIdsByAccountAndPartition[_tokenHolder][_partition].length();
    }

    /**
     * @notice Reports whether the current block timestamp is past `_hold.expirationTimestamp`.
     * @dev Uses the time-travel storage wrapper so test environments can mock the clock.
     * @param _hold The hold to evaluate.
     * @return Whether the hold has expired.
     */
    function isHoldExpired(IHoldTypes.Hold memory _hold) internal view returns (bool) {
        return TimeTravelStorageWrapper.getBlockTimestamp() >= _hold.expirationTimestamp;
    }

    /**
     * @notice Validates an operator-driven create-hold request.
     * @dev Runs the regular `checkCreateHoldFromByPartition` guards and additionally verifies
     *      that the caller is an authorised operator for `_from` on `_partition`.
     * @param _expirationTimestamp The proposed hold expiration timestamp.
     * @param _account The address whose KYC / recovery state is examined.
     * @param _to The destination address of the hold.
     * @param _from The token holder whose balance is to be held.
     * @param _escrow The address that may execute the hold.
     * @param _partition The partition under which the hold is created.
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
     * @notice Validates the inputs of a create-hold request from `_from`.
     * @dev Ensures the expiration is in the future, neither the account, destination nor
     *      source is in a recovered state, the source and escrow addresses are valid and the
     *      partition is acceptable for the token's single/multi-partition mode.
     * @param _expirationTimestamp The proposed hold expiration timestamp.
     * @param _account The address whose recovery state is checked.
     * @param _to The destination address of the hold.
     * @param _from The token holder whose balance is to be held.
     * @param _escrow The address that may execute the hold.
     * @param _partition The partition under which the hold is created.
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
        DefaultValueValidation.checkZeroAddress(_from);
        DefaultValueValidation.checkZeroAddress(_escrow);
        ERC1410StorageWrapper.requireDefaultPartitionWithSinglePartition(_partition);
    }

    /**
     * @notice Returns whether `_escrow` is the escrow recorded on `_hold`.
     * @param _hold The hold under inspection.
     * @param _escrow The address being compared against the hold's escrow.
     * @return Whether the address matches the recorded escrow.
     */
    function isEscrow(IHoldTypes.Hold memory _hold, address _escrow) internal pure returns (bool) {
        return _escrow == _hold.escrow;
    }

    /**
     * @notice Reverts with `InvalidHoldAmount` when `_amount` is zero.
     * @dev Guard for hold-creation paths so the storage never accumulates empty hold entries.
     * @param _amount The proposed hold amount.
     */
    function checkNonZeroHoldAmount(uint256 _amount) internal pure {
        if (_amount == 0) revert IHoldTypes.InvalidHoldAmount();
    }

    /**
     * @notice Reverts with `InsufficientHoldBalance` when `_amount` exceeds the hold balance.
     * @dev Guard for execute / release / reclaim flows.
     * @param _amount The amount being operated against the hold.
     * @param holdData The stored hold record providing the available balance.
     */
    function checkHoldAmount(uint256 _amount, IHoldTypes.HoldData memory holdData) internal pure {
        if (_amount > holdData.hold.amount) revert IHoldTypes.InsufficientHoldBalance(holdData.hold.amount, _amount);
    }

    /**
     * @notice Restores the ERC-20 allowance consumed when an authorised hold was opened.
     * @dev No-ops for non-`AUTHORIZED` third-party types. Used by release / reclaim paths so
     *      the third party retains the spending power that funded the hold.
     * @param _thirdPartyType The third-party classification recorded on the hold.
     * @param _holdIdentifier The triple (partition, tokenHolder, holdId) identifying the hold.
     * @param _amount The allowance amount to restore.
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
     * @notice Triggers any pending scheduled adjustments for `_from` on `_partition` so the
     *         hold is created against fully synchronised balances.
     * @dev Targets `address(0)` as the destination because creation does not credit a
     *      destination yet.
     * @param _partition The partition under which the hold will be created.
     * @param _from The token holder whose state is being synchronised.
     */
    function _prepareHoldCreation(bytes32 _partition, address _from) private {
        ERC1410StorageWrapper.triggerAndSyncAll(_partition, _from, address(0));
    }

    /**
     * @notice Persists a new hold record and updates the per-account / per-partition tallies.
     * @dev Allocates a fresh hold id from the per-account / per-partition counter, stamps the
     *      hold with the current ABAF and inserts the id into the `EnumerableSet` index.
     * @param _partition The partition under which the hold is stored.
     * @param _from The token holder owning the hold.
     * @param _hold The hold parameters (amount, expiration, escrow, destination, data).
     * @param _operatorData Additional operator-supplied data attached to the record.
     * @param _thirdPartyType The third-party classification stored with the hold.
     * @param abaf The current ABAF used as the hold's last-applied adjustment factor.
     * @return holdId_ The newly assigned identifier for the stored hold.
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
     * @notice Emits the partition-transfer events that signal a new hold has been opened.
     * @dev Models the freeze as an ERC-20 transfer to `address(0)` combined with an
     *      ERC-1410 `TransferByPartition`, keeping downstream indexers consistent.
     * @param _partition The partition under which the hold was created.
     * @param _from The token holder whose balance is now held.
     * @param amount The amount moved into the hold.
     * @param _operatorData Additional operator-supplied data forwarded into the event.
     */
    function _emitHoldCreationEvents(
        bytes32 _partition,
        address _from,
        uint256 amount,
        bytes memory _operatorData
    ) private {
        ERC20StorageWrapper.performTransfer(_from, address(0), amount);
        emit IERC1410Types.TransferByPartition(
            _partition,
            EvmAccessors.getMsgSender(),
            _from,
            address(0),
            amount,
            _operatorData,
            ""
        );
    }

    /**
     * @notice Decrements the hold by `_amount`; removes it entirely when the new balance is
     *         zero.
     * @dev Keeps the per-account index in sync by removing the id when the hold is drained.
     * @param _holdIdentifier The triple (partition, tokenHolder, holdId) identifying the hold.
     * @param _amount The amount to subtract from the hold.
     */
    function _decreaseOrRemoveHold(IHoldTypes.HoldIdentifier calldata _holdIdentifier, uint256 _amount) private {
        if (decreaseHeldAmount(_holdIdentifier, _amount) == 0) {
            removeHold(_holdIdentifier);
        }
    }

    /**
     * @notice Credits `_to` with `_amount` on `_holdIdentifier.partition`.
     * @dev Uses the partition-only increment when `_to` already holds tokens on the
     *      partition; otherwise registers a new partition entry for the recipient.
     * @param _holdIdentifier The triple (partition, tokenHolder, holdId) identifying the hold.
     * @param _to The destination address being credited.
     * @param _amount The amount being credited.
     */
    function _transferHoldBalance(
        IHoldTypes.HoldIdentifier calldata _holdIdentifier,
        address _to,
        uint256 _amount
    ) private {
        if (ERC1410StorageWrapper.validPartitionForReceiver(_holdIdentifier.partition, _to)) {
            ERC1410StorageWrapper.increasePartitionOnly(_to, _amount, _holdIdentifier.partition);
            return;
        }
        ERC1410StorageWrapper.addPartitionToOnly(_amount, _to, _holdIdentifier.partition);
    }

    /**
     * @notice Notifies the ERC-3643 compliance contract of a hold-driven transfer.
     * @dev Skips the call when `_to` equals the original holder (no real movement of value).
     *      Performs a low-level call that reverts with `ComplianceCallFailed` on failure.
     * @param _holdIdentifier The triple (partition, tokenHolder, holdId) identifying the hold.
     * @param _to The destination address being credited.
     * @param _amount The amount being transferred.
     */
    function _notifyTransferComplianceIfNeeded(
        IHoldTypes.HoldIdentifier calldata _holdIdentifier,
        address _to,
        uint256 _amount
    ) private {
        if (_holdIdentifier.tokenHolder == _to) return;

        address(ERC3643StorageWrapper.getCompliance()).functionCall(
            abi.encodeWithSelector(ICompliance.transferred.selector, _holdIdentifier.tokenHolder, _to, _amount),
            IERC3643Types.ComplianceCallFailed.selector
        );
    }

    /**
     * @notice Emits the partition-transfer events that signal a hold pay-out to `_to`.
     * @dev Mirrors `_emitHoldCreationEvents` but for the inverse leg, transferring out of
     *      the zero address into the destination.
     * @param _holdIdentifier The triple (partition, tokenHolder, holdId) identifying the hold.
     * @param _to The destination address being credited.
     * @param _amount The amount being transferred out of the hold.
     */
    function _emitHoldTransfer(
        IHoldTypes.HoldIdentifier calldata _holdIdentifier,
        address _to,
        uint256 _amount
    ) private {
        ERC20StorageWrapper.performTransfer(address(0), _to, _amount);
        emit IERC1410Types.TransferByPartition(
            _holdIdentifier.partition,
            EvmAccessors.getMsgSender(),
            address(0),
            _to,
            _amount,
            "",
            ""
        );
    }

    /**
     * @notice Dispatches hold-operation validation to the variant-specific checker.
     * @dev Execute paths run the full access / destination / expiration / escrow guard,
     *      reclaim paths require expiry and the remaining variants must not be expired and
     *      must be invoked by the escrow.
     * @param _holdIdentifier The triple (partition, tokenHolder, holdId) identifying the hold.
     * @param holdData The stored hold record under inspection.
     * @param _to The destination address requested by the operation.
     * @param _operation The operation variant (Execute, Release or Reclaim).
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
     * @notice Validates an execute-hold request against all enforcement rules.
     * @dev Reverts with `AccountIsBlocked` when the holder is blocked, with
     *      `InvalidDestinationAddress` when the requested destination breaks the recorded
     *      constraint, with `HoldExpirationReached` past expiry, and with `IsNotEscrow`
     *      when the caller is not the recorded escrow.
     * @param _holdIdentifier The triple (partition, tokenHolder, holdId) identifying the hold.
     * @param holdData The stored hold record under inspection.
     * @param _to The destination address requested by the operation.
     */
    function _validateExecuteHold(
        IHoldTypes.HoldIdentifier calldata _holdIdentifier,
        IHoldTypes.HoldData memory holdData,
        address _to
    ) private view {
        if (!ControlListStorageWrapper.canAccess(_holdIdentifier.tokenHolder)) {
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
     * @notice Validates a reclaim-hold request.
     * @dev Reverts with `HoldExpirationNotReached` when the hold has not yet expired —
     *      reclaim is only legal past expiry.
     * @param holdData The stored hold record under inspection.
     */
    function _validateReclaimHold(IHoldTypes.HoldData memory holdData) private view {
        if (!isHoldExpired(holdData.hold)) {
            revert IHoldTypes.HoldExpirationNotReached();
        }
    }

    /**
     * @notice Validates non-reclaim operations (notably release) that must occur before
     *         expiry.
     * @dev Reverts with `HoldExpirationReached` past expiry and with `IsNotEscrow` when the
     *      caller is not the recorded escrow.
     * @param holdData The stored hold record under inspection.
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
     * @notice Returns the storage pointer to this library's ERC-7201 namespace.
     * @dev Resolves the slot from the precomputed `STORAGE_LOCATION_HOLD` constant via
     *      inline assembly; the namespace is `security.token.standard.storage.Hold`.
     * @return hold_ A storage reference to the `HoldDataStorage` struct.
     */
    function holdStorage() private pure returns (HoldDataStorage storage hold_) {
        bytes32 position = STORAGE_LOCATION_HOLD;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            hold_.slot := position
        }
    }
}
