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
import { IERC20 } from "../../../facets/layer_1/ERC1400/ERC20/IERC20.sol";
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
 * @title Amortisation Storage Wrapper
 * @notice Provides storage and operational logic for token amortisation corporate actions.
 * @dev Manages amortisation schedules, holder-specific holds, and snapshot integrations.
 *      Uses a dedicated storage slot for amortisation data to maintain upgrade safety.
 *      Interacts with corporate actions, scheduled tasks, snapshots, and hold management.
 * @author Hashgraph
 */
library AmortizationStorageWrapper {
    using EnumerableSet for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.UintSet;
    using Pagination for EnumerableSet.AddressSet;
    using Pagination for EnumerableSet.UintSet;

    /**
     * @notice Defines the storage layout for amortisation-related data.
     * @param amortizationHolds Maps corporate action ID and token holder to hold info.
     * @param activeHoldHolders Tracks addresses with active holds per corporate action.
     * @param activeAmortizationIds Set of currently active amortisation identifiers.
     * @param totalHoldByAmortizationId Aggregated token hold amount per corporate action.
     * @param disabledAmortizations Flags indicating whether an amortisation is disabled.
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
     * @notice Registers a new amortisation corporate action and schedules associated tasks.
     * @dev Encodes the amortisation data and registers it under the corporate actions module.
     *      Schedules a snapshot task and snapshot for the record date.
     *      Emits an {AmortizationSet} event upon success.
     *      Reverts with {AmortizationCreationFailed} if the corporate action ID is zero.
     * @param _newAmortization The amortisation configuration including record and execution dates.
     * @return corporateActionId_ The unique identifier assigned to the corporate action.
     * @return amortizationID_ The sequential identifier for the amortisation.
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
     * @notice Cancels an active amortisation prior to its execution date.
     * @dev Verifies the amortisation is active and not yet executed.
     *      Disables the amortisation, removes it from active IDs, and cancels the corporate action.
     *      Emits an {AmortizationCancelled} event.
     *      Reverts with {AmortizationNotActive} or {AmortizationAlreadyExecuted} if Preconditions
     *      are not met.
     * @param _amortizationID The identifier of the amortisation to cancel.
     * @return success_ True if the cancellation succeeds.
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
     * @notice Creates or updates an amortisation hold for a specified token holder.
     * @dev Releases any existing active hold for the holder before creating a new one.
     *      The new hold uses the maximum expiration timestamp and escrow address(this).
     *      Emits an {AmortizationHoldSet} event.
     *      Reverts with {AmortizationNotActive} if the amortisation is disabled.
     *      Reverts with {AmortizationHoldFailed} if the hold creation fails.
     * @param _amortizationID The amortisation identifier.
     * @param _tokenHolder The address of the token holder.
     * @param _tokenAmount The quantity of tokens to hold.
     * @return holdId_ The identifier of the newly created hold.
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
        AmortizationDataStorage storage s = _amortizationStorage();
        IAmortizationStorageWrapper.AmortizationHoldInfo storage existing = s.amortizationHolds[corporateActionId][
            _tokenHolder
        ];
        if (existing.holdActive) {
            IHoldTypes.HoldIdentifier memory id_ = IHoldTypes.HoldIdentifier({
                partition: _DEFAULT_PARTITION,
                tokenHolder: _tokenHolder,
                holdId: existing.holdId
            });
            uint256 existingAmount = HoldStorageWrapper.getHold(id_).hold.amount;
            _releaseHold(_tokenHolder, existing.holdId, existingAmount);
            s.totalHoldByAmortizationId[corporateActionId] -= existingAmount;
        }
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
        if (!success) revert IAmortizationStorageWrapper.AmortizationHoldFailed(corporateActionId, _amortizationID);
        s.amortizationHolds[corporateActionId][_tokenHolder] = IAmortizationStorageWrapper.AmortizationHoldInfo({
            holdId: newHoldId,
            holdActive: true
        });
        s.activeHoldHolders[corporateActionId].add(_tokenHolder);
        s.totalHoldByAmortizationId[corporateActionId] += _tokenAmount;
        holdId_ = newHoldId;
        emit IAmortizationStorageWrapper.AmortizationHoldSet(
            corporateActionId,
            _amortizationID,
            _tokenHolder,
            newHoldId,
            _tokenAmount
        );
    }

    /**
     * @notice Releases an active amortisation hold for a token holder.
     * @dev Verifies the hold is active, retrieves the held amount, and releases it via
     *      the internal helper. Removes the holder from the active set and decrements the
     *      total hold amount. Emits an {AmortizationHoldReleased} event.
     *      Reverts with {AmortizationHoldNotActive} if no active hold exists.
     * @param _amortizationID The amortisation identifier.
     * @param _tokenHolder The address of the token holder whose hold is being released.
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
     * @notice Retrieves the registered details and status of an amortisation.
     * @dev Decodes the corporate action data to reconstruct the amortisation configuration.
     *      Fetches the associated snapshot ID and disabled status.
     * @param _amortizationID The identifier of the amortisation to query.
     * @return registeredAmortization_ The amortisation data and snapshot ID.
     * @return corporateActionId_ The corporate action identifier linked to the amortisation.
     * @return isDisabled_ True if the amortisation has been cancelled or disabled.
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
     * @notice Fetches amortisation details relevant to a specific account.
     * @dev Aggregates snapshot balances, hold status, nominal value, and adjusted balances.
     *      Returns early if no hold exists for the account.
     * @param _amortizationID The amortisation identifier.
     * @param _account The address of the token holder to query.
     * @return amortizationFor_ A struct containing account-specific amortisation data.
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
        amortizationFor_.nominalValue = NominalValueStorageWrapper._getNominalValue();
        amortizationFor_.nominalValueDecimals = NominalValueStorageWrapper._getNominalValueDecimals();
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
     * @notice Retrieves amortisation details for a paginated list of token holders.
     * @dev Fetches the holder list via {getAmortizationHolders}, then resolves details
     *      for each holder using {getAmortizationFor}.
     * @param _amortizationID The amortisation identifier.
     * @param _pageIndex The page index for pagination.
     * @param _pageLength The number of holders per page.
     * @return amortizationsFor_ An array of account-specific amortisation data.
     * @return holders_ The addresses of the token holders queried.
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
     * @notice Returns the total number of amortisations registered.
     * @dev Counts corporate actions filtered by the amortisation type.
     * @return amortizationCount_ The total count of amortisations.
     */
    function getAmortizationsCount() internal view returns (uint256 amortizationCount_) {
        return CorporateActionsStorageWrapper.getCorporateActionCountByType(AMORTIZATION_CORPORATE_ACTION_TYPE);
    }

    /**
     * @notice Retrieves the list of token holders for an amortisation, paginated.
     * @dev Returns an empty array if the amortisation is disabled without a snapshot,
     *      or if the record date has not been reached.
     *      Uses snapshot holders if available; otherwise falls back to current token holders.
     * @param _amortizationID The amortisation identifier.
     * @param _pageIndex The page index for pagination.
     * @param _pageLength The number of holders per page.
     * @return holders_ The addresses of the relevant token holders.
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
     * @notice Returns the total number of token holders for an amortisation.
     * @dev Returns zero if the amortisation is disabled without a snapshot,
     *      or if the record date has not been reached.
     *      Prefers snapshot holder counts when a snapshot exists.
     * @param _amortizationID The amortisation identifier.
     * @return The total count of token holders.
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
     * @notice Retrieves the paginated list of token holders with active amortisation holds.
     * @param _amortizationID The amortisation identifier.
     * @param _pageIndex The page index for pagination.
     * @param _pageLength The number of holders per page.
     * @return holders_ The addresses of holders with active holds.
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
     * @notice Returns the total number of token holders with active holds for an amortisation.
     * @param _amortizationID The amortisation identifier.
     * @return The total count of active holders.
     */
    function getTotalAmortizationActiveHolders(uint256 _amortizationID) internal view returns (uint256) {
        bytes32 corporateActionId = CorporateActionsStorageWrapper.getCorporateActionIdByTypeIndex(
            AMORTIZATION_CORPORATE_ACTION_TYPE,
            _amortizationID - 1
        );
        return _amortizationStorage().activeHoldHolders[corporateActionId].length();
    }

    /**
     * @notice Returns the aggregated hold amount for an amortisation.
     * @param _amortizationID The amortisation identifier.
     * @return The total token amount currently held across all holders.
     */
    function getTotalHoldByAmortizationId(uint256 _amortizationID) internal view returns (uint256) {
        bytes32 corporateActionId = CorporateActionsStorageWrapper.getCorporateActionIdByTypeIndex(
            AMORTIZATION_CORPORATE_ACTION_TYPE,
            _amortizationID - 1
        );
        return _amortizationStorage().totalHoldByAmortizationId[corporateActionId];
    }

    /**
     * @notice Retrieves a paginated list of active amortisation identifiers.
     * @param _pageIndex The page index for pagination.
     * @param _pageLength The number of IDs per page.
     * @return activeIds_ An array of active amortisation IDs.
     */
    function getActiveAmortizationIds(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (uint256[] memory activeIds_) {
        return _amortizationStorage().activeAmortizationIds.getFromSet(_pageIndex, _pageLength);
    }

    /**
     * @notice Returns the total number of active amortisations.
     * @return The count of active amortisation IDs.
     */
    function getTotalActiveAmortizationIds() internal view returns (uint256) {
        return _amortizationStorage().activeAmortizationIds.length();
    }

    /**
     * @notice Validates that an amortisation has no active holds remaining.
     * @dev Reverts with {AmortizationHasActiveHolds} if any active holds exist.
     *      Typically invoked as a precondition before destructive operations.
     * @param _amortizationID The amortisation identifier to validate.
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
     * @notice Ensures the provided token amount is greater than zero.
     * @dev Reverts with {InvalidAmortizationHoldAmount} if the amount is zero.
     * @param _tokenAmount The amount to validate.
     * @param _amortizationID The amortisation identifier for error context.
     */
    function checkPositiveTokenAmount(uint256 _tokenAmount, uint256 _amortizationID) internal pure {
        if (_tokenAmount == 0) revert IAmortizationStorageWrapper.InvalidAmortizationHoldAmount(_amortizationID);
    }

    /**
     * @notice Internal helper that releases a hold and emits transfer events.
     * @dev Directly accesses hold storage to release the specified amount.
     *      Removes the LABAF adjustment for the hold and emits {TransferByPartition} and
     *      {Transfer} events to reflect the release.
     * @param _tokenHolder The address of the token holder.
     * @param _holdId The identifier of the hold to release.
     * @param _amount The quantity of tokens to release.
     * @return True if the release succeeds.
     */
    function _releaseHold(address _tokenHolder, uint256 _holdId, uint256 _amount) private returns (bool) {
        bytes32 partition = _DEFAULT_PARTITION;
        HoldStorageWrapper.releaseAmortization(_tokenHolder, _holdId, _amount, partition);
        // Remove LABAF hold
        AdjustBalancesStorageWrapper.removeLabafHold(partition, _tokenHolder, _holdId);
        // Emit events
        emit IERC1410Types.TransferByPartition(
            partition,
            EvmAccessors.getMsgSender(),
            address(0),
            _tokenHolder,
            _amount,
            "",
            ""
        );
        emit IERC20.Transfer(address(0), _tokenHolder, _amount);
        return true;
    }

    /**
     * @notice Internal helper that queries the adjusted hold amount at a timestamp.
     * @param _tokenHolder The address of the token holder.
     * @param _holdId The identifier of the hold.
     * @param _timestamp The timestamp at which to evaluate the adjusted amount.
     * @return amount_ The adjusted token amount held at the given timestamp.
     */
    function _getHoldAdjustedAt(
        address _tokenHolder,
        uint256 _holdId,
        uint256 _timestamp
    ) private view returns (uint256 amount_) {
        amount_ = HoldStorageWrapper.getHoldAdjustedAt(_tokenHolder, _DEFAULT_PARTITION, _holdId, _timestamp);
    }

    /**
     * @notice Returns the amortisation data storage struct from its designated slot.
     * @dev Uses inline assembly to bind the storage pointer to {_AMORTIZATION_STORAGE_POSITION}.
     * @return amortizationData_ The amortisation data storage reference.
     */
    function _amortizationStorage() private pure returns (AmortizationDataStorage storage amortizationData_) {
        bytes32 position = _AMORTIZATION_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            amortizationData_.slot := position
        }
    }
}
