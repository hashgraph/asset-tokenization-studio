// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { _AMORTIZATION_STORAGE_POSITION } from "../../../constants/storagePositions.sol";
import {
    AMORTIZATION_CORPORATE_ACTION_TYPE,
    SNAPSHOT_RESULT_ID,
    SNAPSHOT_TASK_TYPE,
    _DEFAULT_PARTITION
} from "../../../constants/values.sol";
import { IAmortization } from "../../../facets/layer_2/amortization/IAmortization.sol";
import { IAmortizationStorageWrapper } from "./IAmortizationStorageWrapper.sol";
import { IHoldTypes } from "../../../facets/layer_1/hold/IHoldTypes.sol";
import { IERC1410Types } from "../../../facets/layer_1/ERC1400/ERC1410/IERC1410Types.sol";
import { ITransfer } from "../../../facets/transfer/ITransfer.sol";
import { ThirdPartyType } from "../types/ThirdPartyType.sol";
import { Pagination } from "../../../infrastructure/utils/Pagination.sol";
import { TimeTravelStorageWrapper } from "../../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { CorporateActionsStorageWrapper } from "../../core/CorporateActionsStorageWrapper.sol";
import { ScheduledTasksStorageWrapper } from "../ScheduledTasksStorageWrapper.sol";
import { SnapshotsStorageWrapper } from "../SnapshotsStorageWrapper.sol";
import { HoldStorageWrapper } from "../HoldStorageWrapper.sol";
import { ERC1410StorageWrapper } from "../ERC1410StorageWrapper.sol";
import { AdjustBalancesStorageWrapper } from "../AdjustBalancesStorageWrapper.sol";
import { ERC20StorageWrapper } from "../ERC20StorageWrapper.sol";
import { EvmAccessors } from "../../../infrastructure/utils/EvmAccessors.sol";
import { NominalValueStorageWrapper } from "../nominalValue/NominalValueStorageWrapper.sol";

/**
 * @title Amortization Storage Wrapper
 * @notice Provides diamond-storage accessors and helpers for amortisation lifecycle data.
 * @dev Coordinates amortisation corporate actions, snapshots, scheduled tasks and token holds.
 *      The library stores data at a fixed storage slot and is intended for delegatecall use.
 * @author Hashgraph
 */
library AmortizationStorageWrapper {
    using EnumerableSet for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.UintSet;
    using Pagination for EnumerableSet.AddressSet;
    using Pagination for EnumerableSet.UintSet;

    /**
     * @notice Stores amortisation-specific state for corporate actions and related holds.
     * @param amortizationHolds Hold metadata keyed by corporate action and token holder.
     * @param activeHoldHolders Token holders with an active amortisation hold per action.
     * @param activeAmortizationIds Active amortisation identifiers available for pagination.
     * @param totalHoldByAmortizationId Total held token amount per amortisation action.
     * @param disabledAmortizations Disabled status keyed by corporate action identifier.
     */
    struct AmortizationDataStorage {
        // solhint-disable max-line-length
        mapping(bytes32 corporateActionId => mapping(address tokenHolder => IAmortizationStorageWrapper.AmortizationHoldInfo)) amortizationHolds;
        mapping(bytes32 corporateActionId => EnumerableSet.AddressSet) activeHoldHolders;
        EnumerableSet.UintSet activeAmortizationIds;
        mapping(bytes32 corporateActionId => uint256) totalHoldByAmortizationId;
        mapping(bytes32 corporateActionId => bool) disabledAmortizations;
    }

    /**
     * @notice Registers a new amortisation and schedules the associated snapshot task.
     * @dev Persists the action through corporate-action storage, schedules record-date tasks,
     *      tracks the amortisation as active and emits `AmortizationSet`.
     *      Reverts if the corporate action cannot be created.
     * @param _newAmortization Amortisation data containing record and execution dates.
     * @return corporateActionId_ Identifier assigned to the created corporate action.
     * @return amortizationID_ Sequential amortisation identifier assigned by storage.
     */
    function setAmortization(
        IAmortization.Amortization memory _newAmortization
    ) internal returns (bytes32 corporateActionId_, uint256 amortizationID_) {
        (corporateActionId_, amortizationID_) = CorporateActionsStorageWrapper.addCorporateAction(
            AMORTIZATION_CORPORATE_ACTION_TYPE,
            abi.encode(_newAmortization)
        );
        if (corporateActionId_ == bytes32(0)) revert IAmortizationStorageWrapper.AmortizationCreationFailed();
        ScheduledTasksStorageWrapper.addScheduledCrossOrderedTask(_newAmortization.recordDate, SNAPSHOT_TASK_TYPE);
        ScheduledTasksStorageWrapper.addScheduledSnapshot(_newAmortization.recordDate, corporateActionId_);
        _amortizationStorage().activeAmortizationIds.add(amortizationID_);
        emit IAmortizationStorageWrapper.AmortizationSet(
            corporateActionId_,
            amortizationID_,
            EvmAccessors.getMsgSender(),
            _newAmortization.recordDate,
            _newAmortization.executionDate
        );
    }

    /**
     * @notice Cancels an active amortisation before its execution date.
     * @dev Marks the action as disabled, removes it from the active identifier set, cancels the
     *      corporate action and emits `AmortizationCancelled`. Reverts if already disabled or
     *      if the execution date has been reached.
     * @param _amortizationID Sequential amortisation identifier to cancel.
     * @return success_ True when the amortisation is cancelled.
     */
    function cancelAmortization(uint256 _amortizationID) internal returns (bool success_) {
        (
            IAmortization.RegisteredAmortization memory registeredAmortization,
            bytes32 corporateActionId,
            bool isDisabled
        ) = getAmortization(_amortizationID);
        if (isDisabled) revert IAmortizationStorageWrapper.AmortizationNotActive(corporateActionId, _amortizationID);
        if (registeredAmortization.amortization.executionDate <= TimeTravelStorageWrapper.getBlockTimestamp()) {
            revert IAmortizationStorageWrapper.AmortizationAlreadyExecuted(corporateActionId, _amortizationID);
        }
        _amortizationStorage().disabledAmortizations[corporateActionId] = true;
        _amortizationStorage().activeAmortizationIds.remove(_amortizationID);
        CorporateActionsStorageWrapper.cancelCorporateAction(corporateActionId);
        emit IAmortizationStorageWrapper.AmortizationCancelled(_amortizationID, EvmAccessors.getMsgSender());
        success_ = true;
    }

    /**
     * @notice Creates or replaces an amortisation hold for a token holder.
     * @dev Releases any existing active amortisation hold for the holder before creating a new
     *      controller hold on the default partition. Emits `AmortizationHoldSet`.
     *      Reverts when the amortisation is disabled or hold creation fails.
     * @param _amortizationID Sequential amortisation identifier.
     * @param _tokenHolder Account whose tokens are placed on hold.
     * @param _tokenAmount Token amount to hold.
     * @return holdId_ Identifier of the newly created hold.
     */
    function setAmortizationHold(
        uint256 _amortizationID,
        address _tokenHolder,
        uint256 _tokenAmount
    ) internal returns (uint256 holdId_) {
        bytes32 corporateActionId = CorporateActionsStorageWrapper.getCorporateActionIdByTypeIndex(
            AMORTIZATION_CORPORATE_ACTION_TYPE,
            _amortizationID - 1
        );
        if (_amortizationStorage().disabledAmortizations[corporateActionId]) {
            revert IAmortizationStorageWrapper.AmortizationNotActive(corporateActionId, _amortizationID);
        }
        _releaseExistingAmortizationHold(corporateActionId, _tokenHolder);
        holdId_ = _createAmortizationHold(corporateActionId, _amortizationID, _tokenHolder, _tokenAmount);
        emit IAmortizationStorageWrapper.AmortizationHoldSet(
            corporateActionId,
            _amortizationID,
            _tokenHolder,
            holdId_,
            _tokenAmount
        );
    }

    /**
     * @notice Releases an active amortisation hold for a token holder.
     * @dev Releases the full hold amount, updates active-holder and aggregate-held state, and
     *      emits `AmortizationHoldReleased`. Reverts if no active hold exists.
     * @param _amortizationID Sequential amortisation identifier.
     * @param _tokenHolder Account whose amortisation hold is released.
     */
    function releaseAmortizationHold(uint256 _amortizationID, address _tokenHolder) internal {
        bytes32 corporateActionId = CorporateActionsStorageWrapper.getCorporateActionIdByTypeIndex(
            AMORTIZATION_CORPORATE_ACTION_TYPE,
            _amortizationID - 1
        );
        AmortizationDataStorage storage s = _amortizationStorage();
        IAmortizationStorageWrapper.AmortizationHoldInfo storage holdInfo = s.amortizationHolds[corporateActionId][
            _tokenHolder
        ];
        if (!holdInfo.holdActive) {
            revert IAmortizationStorageWrapper.AmortizationHoldNotActive(
                corporateActionId,
                _amortizationID,
                _tokenHolder
            );
        }
        IHoldTypes.HoldIdentifier memory id_ = IHoldTypes.HoldIdentifier({
            partition: _DEFAULT_PARTITION,
            tokenHolder: _tokenHolder,
            holdId: holdInfo.holdId
        });
        uint256 holdAmount = HoldStorageWrapper.getHold(id_).hold.amount;
        _releaseHold(_tokenHolder, holdInfo.holdId, holdAmount);
        uint256 releasedHoldId = holdInfo.holdId;
        holdInfo.holdActive = false;
        s.activeHoldHolders[corporateActionId].remove(_tokenHolder);
        s.totalHoldByAmortizationId[corporateActionId] -= holdAmount;
        emit IAmortizationStorageWrapper.AmortizationHoldReleased(
            corporateActionId,
            _amortizationID,
            _tokenHolder,
            releasedHoldId
        );
    }

    /**
     * @notice Returns registered amortisation data and disabled status.
     * @dev Resolves the corporate action by amortisation index and decodes its stored payload.
     *      Asserts that the corporate-action data exists.
     * @param _amortizationID Sequential amortisation identifier.
     * @return registeredAmortization_ Decoded amortisation data and related snapshot id.
     * @return corporateActionId_ Corporate action identifier associated with the amortisation.
     * @return isDisabled_ True when the amortisation has been cancelled or disabled.
     */
    function getAmortization(
        uint256 _amortizationID
    )
        internal
        view
        returns (
            IAmortization.RegisteredAmortization memory registeredAmortization_,
            bytes32 corporateActionId_,
            bool isDisabled_
        )
    {
        corporateActionId_ = CorporateActionsStorageWrapper.getCorporateActionIdByTypeIndex(
            AMORTIZATION_CORPORATE_ACTION_TYPE,
            _amortizationID - 1
        );
        (, , bytes memory data, ) = CorporateActionsStorageWrapper.getCorporateAction(corporateActionId_);
        assert(data.length > 0);
        registeredAmortization_.amortization = abi.decode(data, (IAmortization.Amortization));
        registeredAmortization_.snapshotId = CorporateActionsStorageWrapper.getUintResultAt(
            corporateActionId_,
            SNAPSHOT_RESULT_ID
        );
        isDisabled_ = _amortizationStorage().disabledAmortizations[corporateActionId_];
    }

    /**
     * @notice Returns amortisation, snapshot and hold information for an account.
     * @dev Reads snapshot balances when available, otherwise uses current adjusted state at the
     *      configured timestamp. Includes nominal value and hold adjustment metadata.
     * @param _amortizationID Sequential amortisation identifier.
     * @param _account Account for which amortisation information is queried.
     * @return amortizationFor_ Account-specific amortisation details.
     */
    function getAmortizationFor(
        uint256 _amortizationID,
        address _account
    ) internal view returns (IAmortization.AmortizationFor memory amortizationFor_) {
        (
            IAmortization.RegisteredAmortization memory registeredAmortization,
            bytes32 corporateActionId,

        ) = getAmortization(_amortizationID);
        amortizationFor_.recordDate = registeredAmortization.amortization.recordDate;
        amortizationFor_.executionDate = registeredAmortization.amortization.executionDate;
        IAmortizationStorageWrapper.AmortizationHoldInfo storage holdInfo = _amortizationStorage().amortizationHolds[
            corporateActionId
        ][_account];
        amortizationFor_.holdId = holdInfo.holdId;
        amortizationFor_.holdActive = holdInfo.holdActive;
        (
            amortizationFor_.tokenBalance,
            amortizationFor_.decimalsBalance,
            amortizationFor_.recordDateReached
        ) = SnapshotsStorageWrapper.getSnapshotTakenBalance(
            registeredAmortization.amortization.recordDate,
            registeredAmortization.snapshotId,
            _account
        );
        uint256 timestamp = TimeTravelStorageWrapper.getBlockTimestamp();
        amortizationFor_.abafAtSnapshot = registeredAmortization.snapshotId != 0
            ? SnapshotsStorageWrapper.abafAtSnapshot(registeredAmortization.snapshotId)
            : amortizationFor_.abafAtSnapshot = AdjustBalancesStorageWrapper.getAbafAdjustedAt(timestamp);
        amortizationFor_.nominalValue = NominalValueStorageWrapper.getNominalValue();
        amortizationFor_.nominalValueDecimals = NominalValueStorageWrapper.getNominalValueDecimals();
        if (holdInfo.holdId == 0) return amortizationFor_;
        (amortizationFor_.tokenHeldAmount, , , , , , ) = HoldStorageWrapper.getHoldForByPartitionAdjustedAt(
            IHoldTypes.HoldIdentifier({
                partition: _DEFAULT_PARTITION,
                tokenHolder: _account,
                holdId: holdInfo.holdId
            }),
            timestamp
        );
        amortizationFor_.decimalsHeld = ERC20StorageWrapper.decimalsAdjustedAt(timestamp);
        amortizationFor_.abafAtHold = AdjustBalancesStorageWrapper.getAbafAdjustedAt(timestamp);
    }

    /**
     * @notice Returns paginated account-specific amortisation information.
     * @dev Resolves eligible holders first, then performs one account query per holder. Gas cost
     *      scales linearly with returned page length.
     * @param _amortizationID Sequential amortisation identifier.
     * @param _pageIndex Zero-based page index.
     * @param _pageLength Maximum number of holders to return.
     * @return amortizationsFor_ Account-specific amortisation data for the returned holders.
     * @return holders_ Holder addresses included in the page.
     */
    function getAmortizationsFor(
        uint256 _amortizationID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (IAmortization.AmortizationFor[] memory amortizationsFor_, address[] memory holders_) {
        holders_ = getAmortizationHolders(_amortizationID, _pageIndex, _pageLength);
        uint256 length = holders_.length;
        amortizationsFor_ = new IAmortization.AmortizationFor[](length);
        for (uint256 i; i < length; ) {
            amortizationsFor_[i] = getAmortizationFor(_amortizationID, holders_[i]);
            unchecked {
                ++i;
            }
        }
    }

    /**
     * @notice Returns the total number of amortisation corporate actions.
     * @dev Counts all amortisations registered under the amortisation corporate-action type,
     *      including disabled amortisations.
     * @return amortizationCount_ Total number of registered amortisations.
     */
    function getAmortizationsCount() internal view returns (uint256 amortizationCount_) {
        return CorporateActionsStorageWrapper.getCorporateActionCountByType(AMORTIZATION_CORPORATE_ACTION_TYPE);
    }

    /**
     * @notice Returns holders eligible for an amortisation page.
     * @dev Returns no holders before record date or for disabled actions without a snapshot.
     *      Uses snapshot holders when a snapshot exists; otherwise falls back to current holders.
     * @param _amortizationID Sequential amortisation identifier.
     * @param _pageIndex Zero-based page index.
     * @param _pageLength Maximum number of holders to return.
     * @return holders_ Holder addresses for the requested page.
     */
    function getAmortizationHolders(
        uint256 _amortizationID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (address[] memory holders_) {
        (IAmortization.RegisteredAmortization memory registeredAmortization, , bool isDisabled) = getAmortization(
            _amortizationID
        );
        if (isDisabled && registeredAmortization.snapshotId == 0) return new address[](0);
        uint256 now_ = TimeTravelStorageWrapper.getBlockTimestamp();
        if (registeredAmortization.amortization.recordDate >= now_) return new address[](0);
        if (registeredAmortization.snapshotId != 0) {
            return SnapshotsStorageWrapper.tokenHoldersAt(registeredAmortization.snapshotId, _pageIndex, _pageLength);
        }
        return ERC1410StorageWrapper.getTokenHolders(_pageIndex, _pageLength);
    }

    /**
     * @notice Returns the number of holders eligible for an amortisation.
     * @dev Mirrors `getAmortizationHolders` eligibility rules without returning holder data.
     * @param _amortizationID Sequential amortisation identifier.
     * @return Total eligible holder count.
     */
    function getTotalAmortizationHolders(uint256 _amortizationID) internal view returns (uint256) {
        (IAmortization.RegisteredAmortization memory registeredAmortization, , bool isDisabled) = getAmortization(
            _amortizationID
        );
        if (isDisabled && registeredAmortization.snapshotId == 0) return 0;
        uint256 now_ = TimeTravelStorageWrapper.getBlockTimestamp();
        if (registeredAmortization.amortization.recordDate >= now_) return 0;
        if (registeredAmortization.snapshotId != 0) {
            return SnapshotsStorageWrapper.totalTokenHoldersAt(registeredAmortization.snapshotId);
        }
        return ERC1410StorageWrapper.getTotalTokenHolders();
    }

    /**
     * @notice Returns token holders with active holds for an amortisation.
     * @dev Reads the active-holder set directly and applies pagination. The returned holders may
     *      differ from snapshot holders because only current active holds are considered.
     * @param _amortizationID Sequential amortisation identifier.
     * @param _pageIndex Zero-based page index.
     * @param _pageLength Maximum number of holders to return.
     * @return holders_ Active amortisation hold holders for the requested page.
     */
    function getAmortizationActiveHolders(
        uint256 _amortizationID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (address[] memory holders_) {
        return
            _amortizationStorage()
                .activeHoldHolders[
                    CorporateActionsStorageWrapper.getCorporateActionIdByTypeIndex(
                        AMORTIZATION_CORPORATE_ACTION_TYPE,
                        _amortizationID - 1
                    )
                ]
                .getFromSet(_pageIndex, _pageLength);
    }

    /**
     * @notice Returns the number of active hold holders for an amortisation.
     * @dev Counts the active-holder set associated with the amortisation corporate action.
     * @param _amortizationID Sequential amortisation identifier.
     * @return Total number of holders with active amortisation holds.
     */
    function getTotalAmortizationActiveHolders(uint256 _amortizationID) internal view returns (uint256) {
        bytes32 corporateActionId = CorporateActionsStorageWrapper.getCorporateActionIdByTypeIndex(
            AMORTIZATION_CORPORATE_ACTION_TYPE,
            _amortizationID - 1
        );
        return _amortizationStorage().activeHoldHolders[corporateActionId].length();
    }

    /**
     * @notice Returns the aggregate active hold amount for an amortisation.
     * @dev The value is updated when amortisation holds are created, replaced or released.
     * @param _amortizationID Sequential amortisation identifier.
     * @return Total token amount currently held for the amortisation.
     */
    function getTotalHoldByAmortizationId(uint256 _amortizationID) internal view returns (uint256) {
        bytes32 corporateActionId = CorporateActionsStorageWrapper.getCorporateActionIdByTypeIndex(
            AMORTIZATION_CORPORATE_ACTION_TYPE,
            _amortizationID - 1
        );
        return _amortizationStorage().totalHoldByAmortizationId[corporateActionId];
    }

    /**
     * @notice Returns paginated active amortisation identifiers.
     * @dev Reads from an enumerable set of active identifiers. Ordering is set-dependent and must
     *      not be relied upon for business logic.
     * @param _pageIndex Zero-based page index.
     * @param _pageLength Maximum number of identifiers to return.
     * @return activeIds_ Active amortisation identifiers for the requested page.
     */
    function getActiveAmortizationIds(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (uint256[] memory activeIds_) {
        return _amortizationStorage().activeAmortizationIds.getFromSet(_pageIndex, _pageLength);
    }

    /**
     * @notice Returns the number of currently active amortisations.
     * @dev Counts amortisations that have not been disabled or removed from the active set.
     * @return Total number of active amortisation identifiers.
     */
    function getTotalActiveAmortizationIds() internal view returns (uint256) {
        return _amortizationStorage().activeAmortizationIds.length();
    }

    /**
     * @notice Ensures an amortisation has no active holds.
     * @dev Reverts with `AmortizationHasActiveHolds` when at least one active holder remains.
     * @param _amortizationID Sequential amortisation identifier.
     */
    function checkNoActiveAmortizationHolds(uint256 _amortizationID) internal view {
        bytes32 corporateActionId = CorporateActionsStorageWrapper.getCorporateActionIdByTypeIndex(
            AMORTIZATION_CORPORATE_ACTION_TYPE,
            _amortizationID - 1
        );
        if (_amortizationStorage().activeHoldHolders[corporateActionId].length() > 0) {
            revert IAmortizationStorageWrapper.AmortizationHasActiveHolds(corporateActionId, _amortizationID);
        }
    }

    /**
     * @notice Ensures an amortisation hold amount is greater than zero.
     * @dev Reverts with `InvalidAmortizationHoldAmount` for zero token amounts.
     * @param _tokenAmount Token amount to validate.
     * @param _amortizationID Sequential amortisation identifier used in the revert context.
     */
    function checkPositiveTokenAmount(uint256 _tokenAmount, uint256 _amortizationID) internal pure {
        if (_tokenAmount == 0) revert IAmortizationStorageWrapper.InvalidAmortizationHoldAmount(_amortizationID);
    }

    /**
     * @notice Releases an existing active amortisation hold for a holder, if present.
     * @dev No-ops when the stored hold is inactive. Updates aggregate held amount but leaves the
     *      holder-set membership to the subsequent replacement flow.
     * @param _corporateActionId Corporate action identifier for the amortisation.
     * @param _tokenHolder Account whose existing hold may be released.
     */
    function _releaseExistingAmortizationHold(bytes32 _corporateActionId, address _tokenHolder) private {
        AmortizationDataStorage storage s = _amortizationStorage();
        IAmortizationStorageWrapper.AmortizationHoldInfo storage existing = s.amortizationHolds[_corporateActionId][
            _tokenHolder
        ];
        if (!existing.holdActive) return;
        IHoldTypes.HoldIdentifier memory id_ = IHoldTypes.HoldIdentifier({
            partition: _DEFAULT_PARTITION,
            tokenHolder: _tokenHolder,
            holdId: existing.holdId
        });
        uint256 existingAmount = HoldStorageWrapper.getHold(id_).hold.amount;
        _releaseHold(_tokenHolder, existing.holdId, existingAmount);
        s.totalHoldByAmortizationId[_corporateActionId] -= existingAmount;
    }

    /**
     * @notice Creates a default-partition controller hold for an amortisation.
     * @dev Stores hold metadata, tracks the holder as active and increases the aggregate held
     *      amount. Reverts if the underlying hold creation fails.
     * @param _corporateActionId Corporate action identifier for the amortisation.
     * @param _amortizationID Sequential amortisation identifier.
     * @param _tokenHolder Account whose tokens are placed on hold.
     * @param _tokenAmount Token amount to hold.
     * @return holdId_ Identifier of the created hold.
     */
    function _createAmortizationHold(
        bytes32 _corporateActionId,
        uint256 _amortizationID,
        address _tokenHolder,
        uint256 _tokenAmount
    ) private returns (uint256 holdId_) {
        IHoldTypes.Hold memory hold = IHoldTypes.Hold({
            amount: _tokenAmount,
            expirationTimestamp: type(uint256).max,
            escrow: address(this),
            to: address(0),
            data: ""
        });
        (bool success, uint256 newHoldId) = HoldStorageWrapper.createHoldByPartition(
            _DEFAULT_PARTITION,
            _tokenHolder,
            hold,
            "",
            ThirdPartyType.CONTROLLER
        );
        if (!success) revert IAmortizationStorageWrapper.AmortizationHoldFailed(_corporateActionId, _amortizationID);
        AmortizationDataStorage storage s = _amortizationStorage();
        s.amortizationHolds[_corporateActionId][_tokenHolder] = IAmortizationStorageWrapper.AmortizationHoldInfo({
            holdId: newHoldId,
            holdActive: true
        });
        s.activeHoldHolders[_corporateActionId].add(_tokenHolder);
        s.totalHoldByAmortizationId[_corporateActionId] += _tokenAmount;
        holdId_ = newHoldId;
    }

    /**
     * @notice Releases a hold by reducing hold storage and restoring related accounting.
     * @dev Accesses hold storage directly to avoid calldata conversion. Emits ERC1410 and ERC20
     *      transfer-style release events and removes LABAF hold adjustment data.
     *      Reverts if the requested release amount exceeds the stored hold amount.
     * @param _tokenHolder Account that owns the hold.
     * @param _holdId Hold identifier within the default partition.
     * @param _amount Amount to release from the hold.
     * @return True when the hold release completes.
     */
    function _releaseHold(address _tokenHolder, uint256 _holdId, uint256 _amount) private returns (bool) {
        bytes32 partition = _DEFAULT_PARTITION;
        HoldStorageWrapper.HoldDataStorage storage holdStorageRef = HoldStorageWrapper.holdStorage();
        IHoldTypes.HoldData storage holdData = holdStorageRef.holdsByAccountPartitionAndId[_tokenHolder][partition][
            _holdId
        ];
        if (holdData.hold.amount < _amount) {
            revert IHoldTypes.InsufficientHoldBalance(holdData.hold.amount, _amount);
        }
        _decreaseOrRemoveHold(holdStorageRef, holdData, partition, _tokenHolder, _holdId, _amount);
        _restoreAllowanceIfAuthorized(holdStorageRef, holdData, partition, _tokenHolder, _holdId, _amount);
        AdjustBalancesStorageWrapper.removeLabafHold(partition, _tokenHolder, _holdId);
        _emitHoldReleasedEvents(partition, _tokenHolder, _amount);
        return true;
    }

    /**
     * @notice Decreases a hold amount or removes its storage records entirely.
     * @dev Removes hold identifiers and third-party metadata when the full hold is released.
     *      Always decreases account and partition aggregate held balances.
     * @param _holdStorageRef Hold storage reference.
     * @param _holdData Stored hold data to update.
     * @param _partition Partition containing the hold.
     * @param _tokenHolder Account that owns the hold.
     * @param _holdId Hold identifier within the partition.
     * @param _amount Amount to release from the hold.
     */
    function _decreaseOrRemoveHold(
        HoldStorageWrapper.HoldDataStorage storage _holdStorageRef,
        IHoldTypes.HoldData storage _holdData,
        bytes32 _partition,
        address _tokenHolder,
        uint256 _holdId,
        uint256 _amount
    ) private {
        if (_amount == _holdData.hold.amount) {
            _holdStorageRef.holdIdsByAccountAndPartition[_tokenHolder][_partition].remove(_holdId);
            delete _holdStorageRef.holdsByAccountPartitionAndId[_tokenHolder][_partition][_holdId];
            delete _holdStorageRef.holdThirdPartyByAccountPartitionAndId[_tokenHolder][_partition][_holdId];
        } else {
            _holdData.hold.amount -= _amount;
        }
        _holdStorageRef.totalHeldAmountByAccount[_tokenHolder] -= _amount;
        _holdStorageRef.totalHeldAmountByAccountAndPartition[_tokenHolder][_partition] -= _amount;
    }

    /**
     * @notice Restores allowance consumed by an authorised third-party hold.
     * @dev No-ops unless the hold is marked as `AUTHORIZED` and has a recorded third party.
     * @param _holdStorageRef Hold storage reference.
     * @param _holdData Stored hold data used to inspect the third-party type.
     * @param _partition Partition containing the hold.
     * @param _tokenHolder Account that owns the hold.
     * @param _holdId Hold identifier within the partition.
     * @param _amount Amount of allowance to restore.
     */
    function _restoreAllowanceIfAuthorized(
        HoldStorageWrapper.HoldDataStorage storage _holdStorageRef,
        IHoldTypes.HoldData storage _holdData,
        bytes32 _partition,
        address _tokenHolder,
        uint256 _holdId,
        uint256 _amount
    ) private {
        if (_holdData.thirdPartyType != ThirdPartyType.AUTHORIZED) return;
        address thirdParty = _holdStorageRef.holdThirdPartyByAccountPartitionAndId[_tokenHolder][_partition][_holdId];
        if (thirdParty != address(0)) {
            ERC20StorageWrapper.increaseAllowedBalance(_tokenHolder, thirdParty, _amount);
        }
    }

    /**
     * @notice Emits token-standard events representing a hold release.
     * @dev Emits a partition transfer from the zero address to the token holder, followed by the
     *      ERC20 transfer event with the same mint-like direction.
     * @param _partition Partition associated with the released hold.
     * @param _tokenHolder Account receiving released balance.
     * @param _amount Released token amount.
     */
    function _emitHoldReleasedEvents(bytes32 _partition, address _tokenHolder, uint256 _amount) private {
        emit IERC1410Types.TransferByPartition(
            _partition,
            EvmAccessors.getMsgSender(),
            address(0),
            _tokenHolder,
            _amount,
            "",
            ""
        );
        emit ITransfer.Transfer(address(0), _tokenHolder, _amount);
    }

    /**
     * @notice Returns a hold amount adjusted at a specific timestamp.
     * @dev Reads hold storage directly and applies the balance-adjustment factor derived from
     *      the requested timestamp and the hold LABAF value.
     * @param _tokenHolder Account that owns the hold.
     * @param _holdId Hold identifier within the default partition.
     * @param _timestamp Timestamp used to resolve the adjustment factor.
     * @return amount_ Adjusted hold amount.
     */
    function _getHoldAdjustedAt(
        address _tokenHolder,
        uint256 _holdId,
        uint256 _timestamp
    ) private view returns (uint256 amount_) {
        bytes32 partition = _DEFAULT_PARTITION;
        // Direct storage access - no calldata conversion needed
        HoldStorageWrapper.HoldDataStorage storage holdStorageRef = HoldStorageWrapper.holdStorage();
        IHoldTypes.HoldData storage holdData = holdStorageRef.holdsByAccountPartitionAndId[_tokenHolder][partition][
            _holdId
        ];
        // Get base amount
        amount_ = holdData.hold.amount;
        // Apply adjustment factor for timestamp
        uint256 abafAdjusted = AdjustBalancesStorageWrapper.getAbafAdjustedAt(_timestamp);
        uint256 holdLabaf = AdjustBalancesStorageWrapper.getHoldLabafById(partition, _tokenHolder, _holdId);
        amount_ = amount_ * AdjustBalancesStorageWrapper.calculateFactor(abafAdjusted, holdLabaf);
    }

    /**
     * @notice Returns the amortisation diamond-storage pointer.
     * @dev Uses the fixed amortisation storage position. This function must remain aligned with
     *      the storage position constant to preserve upgrade-safe storage layout.
     * @return amortizationData_ Storage pointer for amortisation data.
     */
    function _amortizationStorage() private pure returns (AmortizationDataStorage storage amortizationData_) {
        bytes32 position = _AMORTIZATION_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            amortizationData_.slot := position
        }
    }
}
