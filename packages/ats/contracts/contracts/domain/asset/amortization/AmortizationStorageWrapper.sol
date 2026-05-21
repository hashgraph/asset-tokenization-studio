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
 * @title AmortizationStorageWrapper
 * @author Asset Tokenization Studio Team
 * @notice Library managing the full lifecycle of amortisation corporate actions:
 *         creation, hold placement and release, cancellation, and paginated holder queries.
 * @dev All state resides at `_AMORTIZATION_STORAGE_POSITION` via the diamond-storage pattern.
 *      Hold management writes directly to `HoldStorageWrapper` storage rather than going
 *      through the facet call surface, avoiding calldata-conversion overhead.
 *      Snapshot balances are used after the record date; live ERC1410 state is used before it.
 */
library AmortizationStorageWrapper {
    using EnumerableSet for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.UintSet;
    using Pagination for EnumerableSet.AddressSet;
    using Pagination for EnumerableSet.UintSet;

    /**
     * @notice Diamond-storage layout for all amortisation-related state.
     * @dev `disabledAmortizations` is set atomically with `cancelCorporateAction` to prevent
     *      double-cancels. `activeHoldHolders` tracks accounts with open holds so that the
     *      execution path can iterate without a full token-holder scan.
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
     * @notice Creates a new amortisation corporate action and schedules its snapshot task.
     * @dev Encodes `_newAmortization`, delegates creation to
     *      `CorporateActionsStorageWrapper.addCorporateAction`, registers a cross-ordered
     *      snapshot task at the record date, and adds the new ID to the active set.
     *      Reverts with `AmortizationCreationFailed` if the underlying action creation fails.
     *      Emits `IAmortizationStorageWrapper.AmortizationSet`.
     * @param _newAmortization   Amortisation parameters including record and execution dates.
     * @return corporateActionId_ Identifier of the underlying corporate action.
     * @return amortizationID_    One-indexed identifier of the newly created amortisation.
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
     * @notice Cancels a pending amortisation, enforcing that it is still active and that the
     *         execution date has not yet passed.
     * @dev Reverts with `AmortizationNotActive` if already cancelled and with
     *      `AmortizationAlreadyExecuted` if the execution date is in the past.
     *      Delegates the actual storage mutation to `_executeCancelAmortization`.
     *      Emits `IAmortizationStorageWrapper.AmortizationCancelled`.
     * @param _amortizationID The identifier of the amortisation to cancel.
     * @return success_       Always true if no revert occurred.
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

        _executeCancelAmortization(corporateActionId, _amortizationID);

        emit IAmortizationStorageWrapper.AmortizationCancelled(_amortizationID, EvmAccessors.getMsgSender());
        success_ = true;
    }

    /**
     * @notice Cancels an amortisation unconditionally, bypassing the execution-date guard.
     * @dev Use when administrative override is required after the execution date has passed.
     *      Delegates to `_executeCancelAmortization` for the actual storage mutation.
     * @param _amortizationID The identifier of the amortisation to cancel.
     * @return success_ Always true if no revert occurred.
     */
    function forceCancelAmortization(uint256 _amortizationID) internal returns (bool success_) {
        (, bytes32 corporateActionId, ) = getAmortization(_amortizationID);

        _executeCancelAmortization(corporateActionId, _amortizationID);

        success_ = true;
    }

    /**
     * @notice Places (or replaces) an amortisation hold on `_tokenHolder`'s balance.
     * @dev If the holder already has an active hold it is released first and the
     *      `totalHoldByAmortizationId` counter is adjusted accordingly. A new hold is then
     *      created via `HoldStorageWrapper.createHoldByPartition` with
     *      `ThirdPartyType.CONTROLLER` authority and `type(uint256).max` expiry.
     *      Reverts with `AmortizationNotActive` if the amortisation is disabled, and with
     *      `AmortizationHoldFailed` if hold creation fails.
     *      Emits `IAmortizationStorageWrapper.AmortizationHoldSet`.
     * @param _amortizationID The identifier of the amortisation.
     * @param _tokenHolder    Address of the token holder to place the hold on.
     * @param _tokenAmount    Amount of tokens to hold (must be > 0).
     * @return holdId_        Identifier of the newly created hold.
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
     * @notice Releases the active amortisation hold for `_tokenHolder` on a given amortisation.
     * @dev Resolves the corporate action ID by type index, reads the hold amount from
     *      `HoldStorageWrapper`, releases it via `_releaseHold`, clears the `holdActive` flag,
     *      removes the holder from `activeHoldHolders`, and decrements
     *      `totalHoldByAmortizationId`. Reverts with `AmortizationHoldNotActive` when no active
     *      hold exists. Emits `IAmortizationStorageWrapper.AmortizationHoldReleased`.
     * @param _amortizationID The identifier of the amortisation.
     * @param _tokenHolder    Address of the token holder whose hold is being released.
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
     * @notice Retrieves the full amortisation record, its corporate action ID, and disabled
     *         status.
     * @dev Resolves the corporate action ID via the type-index lookup, decodes the stored
     *      `IAmortization.Amortization` bytes, and reads the associated snapshot result ID.
     *      Uses `assert` to enforce non-empty data — panics on storage inconsistency.
     * @param _amortizationID           The one-indexed amortisation identifier.
     * @return registeredAmortization_  Decoded amortisation struct plus snapshot ID.
     * @return corporateActionId_       Underlying corporate action identifier.
     * @return isDisabled_              True if the amortisation has been cancelled.
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
     * @notice Returns the per-account view of an amortisation, including hold state,
     *         snapshot balance, ABAF factors, and nominal value at query time.
     * @dev Balance resolution branches on whether a snapshot has been taken: if
     *      `snapshotId != 0`, snapshot-bound figures are used; otherwise the ABAF-adjusted
     *      state at the current block timestamp applies. Hold amounts are obtained via
     *      `_getHoldAdjustedAt`; decimals and ABAF are read from `ERC20StorageWrapper` and
     *      `AdjustBalancesStorageWrapper`.
     * @param _amortizationID  The identifier of the amortisation to query.
     * @param _account         Address of the holder to inspect.
     * @return amortizationFor_ Aggregated view of the amortisation for the account.
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
     * @notice Returns a paginated batch of per-account amortisation views together with the
     *         corresponding holder addresses.
     * @dev Calls `getAmortizationHolders` to obtain the address page, then iterates calling
     *      `getAmortizationFor` for each. Gas cost scales linearly with `_pageLength`.
     * @param _amortizationID  The identifier of the amortisation.
     * @param _pageIndex       Zero-based page index.
     * @param _pageLength      Maximum number of entries per page.
     * @return amortizationsFor_ Array of per-account amortisation views.
     * @return holders_          Corresponding holder addresses.
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
     * @notice Returns the total number of amortisation corporate actions ever created.
     * @dev Delegates to `CorporateActionsStorageWrapper.getCorporateActionCountByType`.
     * @return amortizationCount_ Total count of registered amortisations.
     */
    function getAmortizationsCount() internal view returns (uint256 amortizationCount_) {
        return CorporateActionsStorageWrapper.getCorporateActionCountByType(AMORTIZATION_CORPORATE_ACTION_TYPE);
    }

    /**
     * @notice Returns a paginated list of token holders eligible for an amortisation payout.
     * @dev Returns an empty array if the amortisation is disabled (and no snapshot exists), or
     *      if the record date has not yet been reached. After the record date, holders are
     *      sourced from the bound snapshot when one exists, otherwise from the live ERC1410
     *      holder set.
     * @param _amortizationID The identifier of the amortisation.
     * @param _pageIndex      Zero-based page index.
     * @param _pageLength     Maximum number of addresses per page.
     * @return holders_       Paginated array of eligible holder addresses.
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
     * @notice Returns the total number of token holders eligible for an amortisation payout.
     * @dev Mirrors `getAmortizationHolders` logic but returns a count. Returns zero before
     *      the record date or when the amortisation is disabled without a snapshot.
     * @param _amortizationID The identifier of the amortisation.
     * @return Total number of eligible holders.
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
     * @notice Returns a paginated list of holders that currently have an active amortisation
     *         hold.
     * @dev Reads directly from `activeHoldHolders` in `AmortizationDataStorage` using
     *      `EnumerableSet.getFromSet`. Only accounts that have not yet had their hold released
     *      appear in this set.
     * @param _amortizationID The identifier of the amortisation.
     * @param _pageIndex      Zero-based page index.
     * @param _pageLength     Maximum number of addresses per page.
     * @return holders_       Paginated array of addresses with active holds.
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
     * @notice Returns the total number of holders with an active amortisation hold.
     * @dev Reads `activeHoldHolders[corporateActionId].length()` from diamond storage.
     * @param _amortizationID The identifier of the amortisation.
     * @return Total count of holders with an active hold for this amortisation.
     */
    function getTotalAmortizationActiveHolders(uint256 _amortizationID) internal view returns (uint256) {
        bytes32 corporateActionId = CorporateActionsStorageWrapper.getCorporateActionIdByTypeIndex(
            AMORTIZATION_CORPORATE_ACTION_TYPE,
            _amortizationID - 1
        );
        return _amortizationStorage().activeHoldHolders[corporateActionId].length();
    }

    /**
     * @notice Returns the aggregate token amount currently held across all active holds for a
     *         given amortisation.
     * @dev Reads `totalHoldByAmortizationId[corporateActionId]` from storage. This counter is
     *      incremented by `setAmortizationHold` and decremented by `releaseAmortizationHold`.
     * @param _amortizationID The identifier of the amortisation.
     * @return Total held token amount for the amortisation.
     */
    function getTotalHoldByAmortizationId(uint256 _amortizationID) internal view returns (uint256) {
        bytes32 corporateActionId = CorporateActionsStorageWrapper.getCorporateActionIdByTypeIndex(
            AMORTIZATION_CORPORATE_ACTION_TYPE,
            _amortizationID - 1
        );
        return _amortizationStorage().totalHoldByAmortizationId[corporateActionId];
    }

    /**
     * @notice Returns a paginated list of amortisation IDs that have not yet been cancelled.
     * @dev Reads from `activeAmortizationIds` in `AmortizationDataStorage` using
     *      `EnumerableSet.getFromSet`. Cancelled amortisations are removed from this set by
     *      `_executeCancelAmortization`.
     * @param _pageIndex  Zero-based page index.
     * @param _pageLength Maximum number of IDs per page.
     * @return activeIds_ Paginated array of active amortisation identifiers.
     */
    function getActiveAmortizationIds(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (uint256[] memory activeIds_) {
        return _amortizationStorage().activeAmortizationIds.getFromSet(_pageIndex, _pageLength);
    }

    /**
     * @notice Returns the total number of amortisations that are currently active (not cancelled).
     * @dev Reads `activeAmortizationIds.length()` from diamond storage.
     * @return Total count of active amortisation IDs.
     */
    function getTotalActiveAmortizationIds() internal view returns (uint256) {
        return _amortizationStorage().activeAmortizationIds.length();
    }

    /**
     * @notice Reverts if the given amortisation has any outstanding active holds.
     * @dev Used as a pre-condition guard before operations that require all holds to have been
     *      released. Reverts with
     *      `IAmortizationStorageWrapper.AmortizationHasActiveHolds` when the
     *      `activeHoldHolders` set is non-empty.
     * @param _amortizationID The identifier of the amortisation to check.
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
     * @notice Reverts if `_tokenAmount` is zero.
     * @dev Pre-condition guard used before placing an amortisation hold. Reverts with
     *      `IAmortizationStorageWrapper.InvalidAmortizationHoldAmount`.
     * @param _tokenAmount    The token amount to validate.
     * @param _amortizationID The amortisation identifier used in the revert payload.
     */
    function checkPositiveTokenAmount(uint256 _tokenAmount, uint256 _amortizationID) internal pure {
        if (_tokenAmount == 0) revert IAmortizationStorageWrapper.InvalidAmortizationHoldAmount(_amortizationID);
    }

    /**
     * @notice Performs the storage writes that cancel an amortisation.
     * @dev Marks the corporate action as disabled, removes the amortisation from the
     *      active-IDs set, and delegates to `CorporateActionsStorageWrapper.cancelCorporateAction`.
     * @param corporateActionId The corporate-action identifier linked to the amortisation.
     * @param _amortizationID   The one-indexed amortisation identifier to remove from the active set.
     */
    function _executeCancelAmortization(bytes32 corporateActionId, uint256 _amortizationID) private {
        _amortizationStorage().disabledAmortizations[corporateActionId] = true;
        _amortizationStorage().activeAmortizationIds.remove(_amortizationID);
        CorporateActionsStorageWrapper.cancelCorporateAction(corporateActionId);
    }

    /**
     * @notice Releases `_amount` tokens from the hold identified by `_holdId` for `_tokenHolder`.
     * @dev Bypasses the facet call surface and writes directly to `HoldStorageWrapper` storage to
     *      avoid calldata-conversion overhead. If `_amount` equals the full hold amount the hold
     *      record is deleted entirely; otherwise only the amount field is decremented.
     *      Restores the ERC-20 allowance when the hold was placed by an AUTHORIZED third party.
     *      Removes the LABAF hold entry via `AdjustBalancesStorageWrapper.removeLabafHold`.
     *      Emits `IERC1410Types.TransferByPartition` and `ITransfer.Transfer`.
     *      Reverts with `IHoldTypes.InsufficientHoldBalance` when stored amount < `_amount`.
     * @param _tokenHolder Address whose hold is being released.
     * @param _holdId      Identifier of the hold to release.
     * @param _amount      Token amount to release from the hold.
     * @return True once the hold has been released.
     */
    function _releaseHold(address _tokenHolder, uint256 _holdId, uint256 _amount) private returns (bool) {
        bytes32 partition = _DEFAULT_PARTITION;

        // Direct storage access - no calldata conversion needed
        HoldStorageWrapper.HoldDataStorage storage holdStorageRef = HoldStorageWrapper.holdStorage();

        // Get hold data
        IHoldTypes.HoldData storage holdData = holdStorageRef.holdsByAccountPartitionAndId[_tokenHolder][partition][
            _holdId
        ];

        // Validate hold exists and has sufficient amount
        if (holdData.hold.amount < _amount) {
            revert IHoldTypes.InsufficientHoldBalance(holdData.hold.amount, _amount);
        }

        // Decrease or remove hold
        if (_amount == holdData.hold.amount) {
            // Remove completely
            holdStorageRef.holdIdsByAccountAndPartition[_tokenHolder][partition].remove(_holdId);
            delete holdStorageRef.holdsByAccountPartitionAndId[_tokenHolder][partition][_holdId];
            delete holdStorageRef.holdThirdPartyByAccountPartitionAndId[_tokenHolder][partition][_holdId];
        } else {
            // Decrease amount
            holdData.hold.amount -= _amount;
        }

        // Update totals
        holdStorageRef.totalHeldAmountByAccount[_tokenHolder] -= _amount;
        holdStorageRef.totalHeldAmountByAccountAndPartition[_tokenHolder][partition] -= _amount;

        // Restore allowance if AUTHORIZED third party
        if (holdData.thirdPartyType == ThirdPartyType.AUTHORIZED) {
            address thirdParty = holdStorageRef.holdThirdPartyByAccountPartitionAndId[_tokenHolder][partition][_holdId];
            if (thirdParty != address(0)) {
                ERC20StorageWrapper.increaseAllowedBalance(_tokenHolder, thirdParty, _amount);
            }
        }

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
        emit ITransfer.Transfer(address(0), _tokenHolder, _amount);

        return true;
    }

    /**
     * @notice Returns the ABAF-adjusted hold amount for `_tokenHolder` at `_timestamp`.
     * @dev Reads the raw hold amount directly from `HoldStorageWrapper` storage, then scales
     *      it by `calculateFactor(abafAdjusted, holdLabaf)` to account for any balance-adjustment
     *      factor recorded between hold creation and `_timestamp`.
     * @param _tokenHolder Address of the token holder.
     * @param _holdId      Identifier of the hold to read.
     * @param _timestamp   Timestamp at which the ABAF factor is evaluated.
     * @return amount_     ABAF-adjusted hold amount at the given timestamp.
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
     * @notice Returns a storage pointer to `AmortizationDataStorage` at the dedicated slot.
     * @dev Uses inline assembly with the diamond-storage pattern to load the struct pointer at
     *      `_AMORTIZATION_STORAGE_POSITION`.
     * @return amortizationData_ Storage reference to the amortisation data layout.
     */
    function _amortizationStorage() private pure returns (AmortizationDataStorage storage amortizationData_) {
        bytes32 position = _AMORTIZATION_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            amortizationData_.slot := position
        }
    }
}
