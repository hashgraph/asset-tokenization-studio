// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { SNAPSHOT_RESULT_ID, DEFAULT_PARTITION } from "../../constants/values.sol";
import { CORPORATE_ACTION_TYPE_AMORTIZATION, SCHEDULED_TASK_TYPE_SNAPSHOT } from "../../constants/dispatchTypes.sol";
import { IAmortization } from "../../facets/amortization/IAmortization.sol";
import { IHoldTypes } from "../../facets/hold/IHoldTypes.sol";
import { IERC1410Types } from "../../facets/commonTypes/IERC1410Types.sol";
import { ITransfer } from "../../facets/transfer/ITransfer.sol";
import { ThirdPartyType } from "./types/ThirdPartyType.sol";
import { Pagination } from "../../infrastructure/utils/Pagination.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { CorporateActionsStorageWrapper } from "../core/CorporateActionsStorageWrapper.sol";
import { ScheduledTasksStorageWrapper } from "./ScheduledTasksStorageWrapper.sol";
import { SnapshotsStorageWrapper } from "./SnapshotsStorageWrapper.sol";
import { HoldStorageWrapper } from "./HoldStorageWrapper.sol";
import { HoldOps } from "../orchestrator/HoldOps.sol";
import { ERC1410StorageWrapper } from "./ERC1410StorageWrapper.sol";
import { AdjustBalancesStorageWrapper } from "./AdjustBalancesStorageWrapper.sol";
import { ERC20StorageWrapper } from "./ERC20StorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { NominalValueStorageWrapper } from "./NominalValueStorageWrapper.sol";

/// @custom:hash storage Amortization
bytes32 constant STORAGE_LOCATION_AMORTIZATION = 0x6615a5e2562c1a115412fe21b082654124f5af2ecf5b5d6bc9a66d4da90c8600;

/**
 * @notice Per-(amortization, tokenHolder) hold-tracking record.
 * @dev Mapping value of `AmortizationDataStorage.amortizationHolds`. File-scope per the
 *      project rule that storage data structs are declared in the StorageWrapper.
 * @param holdId   Identifier of the hold (0 = no hold).
 * @param holdActive True while the hold is awaiting DVP/burn.
 */
struct AmortizationHoldInfo {
    uint256 holdId;
    bool holdActive;
}

/**
 * @notice Persistent storage layout for the Amortization facet.
 * @dev Tracks holds, active holders and disabled flags per amortization corporate action.
 *      New fields must be appended below the marker to preserve ERC-7201 slot offsets.
 * @custom:storage-location erc7201:security.token.standard.storage.Amortization
 */
struct AmortizationDataStorage {
    // ─── R1 Lifecycle (bool flags) ───────────────────────────
    // ─── R2 Packed scalars (uint8, bytes3, address, enum) ────
    // ─── R3 Single-slot scalars (uint256, bytes32, string) ───
    // ─── R4 Aggregates (mapping, array, EnumerableSet) ───────
    mapping(bytes32 corporateActionId => mapping(address tokenHolder => AmortizationHoldInfo)) amortizationHolds;
    mapping(bytes32 corporateActionId => EnumerableSet.AddressSet) activeHoldHolders;
    EnumerableSet.UintSet activeAmortizationIds;
    mapping(bytes32 corporateActionId => uint256) totalHoldByAmortizationId;
    mapping(bytes32 corporateActionId => bool) disabledAmortizations;
    // ─── APPEND-ONLY ZONE BELOW ───
}

/**
 * @title AmortizationStorageWrapper
 * @author Asset Tokenization Studio Team
 * @notice Library managing the full lifecycle of amortisation corporate actions:
 *         creation, hold placement and release, cancellation, and paginated holder queries.
 * @dev All state resides at `_AMORTIZATION_STORAGE_POSITION` via the diamond-storage pattern.
 *      Hold creation delegates to `HoldOps` (deployed once, invoked via `delegatecall`) to keep
 *      this facet's own bytecode under the EIP-170 limit. Release still writes directly to
 *      `HoldStorageWrapper` storage, since it also has to resync `totalHoldByAmortizationId` —
 *      bookkeeping `HoldOps` has no notion of — in the same pass as the hold-level resync.
 *      Snapshot balances are used after the record date; live ERC1410 state is used before it.
 */
library AmortizationStorageWrapper {
    using EnumerableSet for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.UintSet;
    using Pagination for EnumerableSet.AddressSet;
    using Pagination for EnumerableSet.UintSet;

    /**
     * @notice Registers a new amortization corporate action and schedules its snapshot.
     * @dev Reverts with {AmortizationCreationFailed} when the registry returns a zero id;
     *      otherwise schedules the snapshot task at the record date and records the active id.
     *      The calling facet (`Amortization`) emits {AmortizationSet}.
     * @param _newAmortization The amortization payload describing record and execution dates.
     * @return corporateActionId_ The identifier of the underlying corporate action.
     * @return amortizationID_ The one-based index of the amortization within its type list.
     */
    function setAmortization(
        IAmortization.Amortization memory _newAmortization
    ) internal returns (bytes32 corporateActionId_, uint256 amortizationID_) {
        (corporateActionId_, amortizationID_) = CorporateActionsStorageWrapper.addCorporateAction(
            CORPORATE_ACTION_TYPE_AMORTIZATION,
            abi.encode(_newAmortization)
        );

        if (corporateActionId_ == bytes32(0)) revert IAmortization.AmortizationCreationFailed();

        ScheduledTasksStorageWrapper.addScheduledCrossOrderedTask(
            _newAmortization.recordDate,
            SCHEDULED_TASK_TYPE_SNAPSHOT
        );
        ScheduledTasksStorageWrapper.addScheduledSnapshot(_newAmortization.recordDate, corporateActionId_);
        _amortizationStorage().activeAmortizationIds.add(amortizationID_);
    }

    /**
     * @notice Cancels an amortization that has not yet executed.
     * @dev Reverts with {AmortizationNotActive} if already disabled, or
     *      {AmortizationAlreadyExecuted} if the execution date has been reached.
     *      Disables the amortization, removes it from active ids and cancels the
     *      underlying corporate action.
     * @param _amortizationID The one-based identifier of the amortization to cancel.
     * @return success_ Always true on success; reverts otherwise.
     */
    function cancelAmortization(uint256 _amortizationID) internal returns (bool success_) {
        (
            IAmortization.RegisteredAmortization memory registeredAmortization,
            bytes32 corporateActionId,
            bool isDisabled
        ) = getAmortization(_amortizationID);

        if (isDisabled) revert IAmortization.AmortizationNotActive(corporateActionId, _amortizationID);

        if (registeredAmortization.amortization.executionDate <= TimeTravelStorageWrapper.getBlockTimestamp()) {
            revert IAmortization.AmortizationAlreadyExecuted(corporateActionId, _amortizationID);
        }

        _executeCancelAmortization(corporateActionId, _amortizationID);

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
     * @notice Creates or replaces the amortization hold for a token holder.
     * @dev When an active hold already exists for the same `(amortization, holder)` pair,
     *      that hold is released first and the total adjusted accordingly. A new hold is
     *      then created on the default partition with the contract itself as escrow.
     *      Reverts with {AmortizationNotActive} if the amortization has been disabled. The calling facet
     *      (`Amortization`) emits {AmortizationHoldSet}.
     * @param _amortizationID The one-based identifier of the amortization.
     * @param _tokenHolder The holder against whom the hold is taken.
     * @param _tokenAmount The amount to be held against the upcoming amortization payment.
     * @return corporateActionId_ The identifier of the underlying amortization corporate action.
     * @return holdId_ The identifier of the newly created hold.
     */
    function setAmortizationHold(
        uint256 _amortizationID,
        address _tokenHolder,
        uint256 _tokenAmount
    ) internal returns (bytes32 corporateActionId_, uint256 holdId_) {
        bytes32 corporateActionId = CorporateActionsStorageWrapper.getCorporateActionIdByTypeIndex(
            CORPORATE_ACTION_TYPE_AMORTIZATION,
            _amortizationID - 1
        );
        if (_amortizationStorage().disabledAmortizations[corporateActionId]) {
            revert IAmortization.AmortizationNotActive(corporateActionId, _amortizationID);
        }

        AmortizationDataStorage storage s = _amortizationStorage();
        AmortizationHoldInfo storage existing = s.amortizationHolds[corporateActionId][_tokenHolder];

        if (existing.holdActive) {
            _releaseExistingHold(corporateActionId, _tokenHolder, existing.holdId);
        }

        IHoldTypes.Hold memory hold = IHoldTypes.Hold({
            amount: _tokenAmount,
            expirationTimestamp: type(uint256).max,
            escrow: address(this),
            to: address(0),
            data: ""
        });

        (, uint256 newHoldId) = HoldOps.createHoldByPartition(
            DEFAULT_PARTITION,
            _tokenHolder,
            hold,
            "",
            ThirdPartyType.CONTROLLER
        );

        s.amortizationHolds[corporateActionId][_tokenHolder] = AmortizationHoldInfo({
            holdId: newHoldId,
            holdActive: true
        });
        s.activeHoldHolders[corporateActionId].add(_tokenHolder);
        _syncTotalHoldByAmortizationId(corporateActionId);
        s.totalHoldByAmortizationId[corporateActionId] += _tokenAmount;
        holdId_ = newHoldId;
        corporateActionId_ = corporateActionId;
    }

    /**
     * @notice Releases the amortization hold previously taken for a token holder.
     * @dev Reverts with {AmortizationHoldNotActive} when no active hold is recorded.
     *      Decrements the active-holders set and the aggregate hold counter by the
     *      released amount. The calling facet (`Amortization`) emits {AmortizationHoldReleased}.
     * @param _amortizationID The one-based identifier of the amortization.
     * @param _tokenHolder The holder whose hold is being released.
     * @return corporateActionId_ The identifier of the underlying amortization corporate action.
     * @return releasedHoldId_ The identifier of the hold that was released.
     */
    function releaseAmortizationHold(
        uint256 _amortizationID,
        address _tokenHolder
    ) internal returns (bytes32 corporateActionId_, uint256 releasedHoldId_) {
        bytes32 corporateActionId = CorporateActionsStorageWrapper.getCorporateActionIdByTypeIndex(
            CORPORATE_ACTION_TYPE_AMORTIZATION,
            _amortizationID - 1
        );

        AmortizationDataStorage storage s = _amortizationStorage();
        AmortizationHoldInfo storage holdInfo = s.amortizationHolds[corporateActionId][_tokenHolder];

        if (!holdInfo.holdActive) {
            revert IAmortization.AmortizationHoldNotActive(corporateActionId, _amortizationID, _tokenHolder);
        }

        _releaseExistingHold(corporateActionId, _tokenHolder, holdInfo.holdId);

        uint256 releasedHoldId = holdInfo.holdId;
        holdInfo.holdActive = false;
        s.activeHoldHolders[corporateActionId].remove(_tokenHolder);

        corporateActionId_ = corporateActionId;
        releasedHoldId_ = releasedHoldId;
    }

    /**
     * @notice Returns the registered amortization, its corporate action id and disabled flag.
     * @dev Asserts that the underlying corporate action carries a non-empty payload, then
     *      decodes it into {RegisteredAmortization} and joins the snapshot result, if any.
     * @param _amortizationID The one-based identifier of the amortization.
     * @return registeredAmortization_ The decoded amortization payload and snapshot id.
     * @return corporateActionId_ The identifier of the backing corporate action.
     * @return isDisabled_ Whether the amortization has been cancelled.
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
            CORPORATE_ACTION_TYPE_AMORTIZATION,
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
     * @notice Builds the per-account view of an amortization (balance, hold, nominal value).
     * @dev Combines the corporate action data, the snapshot-taken balance, the adjusted ABAF
     *      at the relevant timestamp and the nominal-value parameters. When the account has
     *      no active hold the function returns early after populating the balance fields.
     * @param _amortizationID The one-based identifier of the amortization.
     * @param _account The token holder under inspection.
     * @return amortizationFor_ The per-account amortization view.
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

        AmortizationHoldInfo storage holdInfo = _amortizationStorage().amortizationHolds[corporateActionId][_account];
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
            IHoldTypes.HoldIdentifier({ partition: DEFAULT_PARTITION, tokenHolder: _account, holdId: holdInfo.holdId }),
            timestamp
        );
        amortizationFor_.decimalsHeld = ERC20StorageWrapper.decimalsAdjustedAt(timestamp);
        amortizationFor_.abafAtHold = AdjustBalancesStorageWrapper.getAbafAdjustedAt(timestamp);
    }

    /**
     * @notice Returns the per-holder amortization views for a paginated slice of holders.
     * @dev Iterates over the paginated holder list returned by {getAmortizationHolders} and
     *      collects the corresponding {AmortizationFor} record for each one.
     * @param _amortizationID The one-based identifier of the amortization.
     * @param _pageIndex The zero-based page index used by the pagination helper.
     * @param _pageLength The maximum number of holders to return per page.
     * @return amortizationsFor_ The per-holder amortization views, in holder order.
     * @return holders_ The matching addresses for the returned views.
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
     * @notice Returns the total number of amortizations registered for this token.
     * @return amortizationCount_ The count of corporate actions of type AMORTIZATION.
     */
    function getAmortizationsCount() internal view returns (uint256 amortizationCount_) {
        return CorporateActionsStorageWrapper.getCorporateActionCountByType(CORPORATE_ACTION_TYPE_AMORTIZATION);
    }

    /**
     * @notice Returns a paginated list of token holders relevant to an amortization.
     * @dev Returns an empty array when the amortization is cancelled with no snapshot or
     *      the record date is still in the future. When a snapshot is available the holders
     *      are read from {SnapshotsStorageWrapper}; otherwise from {ERC1410StorageWrapper}.
     * @param _amortizationID The one-based identifier of the amortization.
     * @param _pageIndex The zero-based page index used by the pagination helper.
     * @param _pageLength The maximum number of holders to return per page.
     * @return holders_ The paginated holder addresses.
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
     * @notice Returns the total number of holders eligible for an amortization.
     * @dev Mirrors {getAmortizationHolders}'s selection logic: zero when disabled with no
     *      snapshot or when the record date is still in the future; snapshot count when a
     *      snapshot is available; otherwise the live ERC-1410 token-holder count.
     * @param _amortizationID The one-based identifier of the amortization.
     * @return The eligible holder count for the amortization.
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
     * @notice Returns the paginated list of holders with an active amortization hold.
     * @dev Reads from the per-amortization {EnumerableSet.AddressSet} of active holders.
     * @param _amortizationID The one-based identifier of the amortization.
     * @param _pageIndex The zero-based page index used by the pagination helper.
     * @param _pageLength The maximum number of holders to return per page.
     * @return holders_ The paginated active-holder addresses.
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
                        CORPORATE_ACTION_TYPE_AMORTIZATION,
                        _amortizationID - 1
                    )
                ]
                .getFromSet(_pageIndex, _pageLength);
    }

    /**
     * @notice Returns the number of holders with an active amortization hold.
     * @param _amortizationID The one-based identifier of the amortization.
     * @return The cardinality of the active-holders set for the amortization.
     */
    function getTotalAmortizationActiveHolders(uint256 _amortizationID) internal view returns (uint256) {
        bytes32 corporateActionId = CorporateActionsStorageWrapper.getCorporateActionIdByTypeIndex(
            CORPORATE_ACTION_TYPE_AMORTIZATION,
            _amortizationID - 1
        );
        return _amortizationStorage().activeHoldHolders[corporateActionId].length();
    }

    /**
     * @notice Returns the aggregate token amount held against a given amortization.
     * @dev Computed live: `_syncTotalHoldByAmortizationId` only rebases the stored total at
     *      write time (the next hold created or released), so a read taken between two writes
     *      would otherwise see the value as of the last touchpoint, not the current ABAF — the
     *      same gap `getHeldAmountFor` closes for the per-account aggregate via
     *      `getHeldAmountForAdjustedAt`.
     * @param _amortizationID The one-based identifier of the amortization.
     * @return The cumulative held amount across every active hold for this amortization,
     *         adjusted to the current ABAF.
     */
    function getTotalHoldByAmortizationId(uint256 _amortizationID) internal view returns (uint256) {
        bytes32 corporateActionId = CorporateActionsStorageWrapper.getCorporateActionIdByTypeIndex(
            CORPORATE_ACTION_TYPE_AMORTIZATION,
            _amortizationID - 1
        );
        return
            _amortizationStorage().totalHoldByAmortizationId[corporateActionId] *
            AdjustBalancesStorageWrapper.calculateFactor(
                AdjustBalancesStorageWrapper.getAbaf(),
                AdjustBalancesStorageWrapper.getAmortizationHoldLabaf(corporateActionId)
            );
    }

    /**
     * @notice Returns the paginated list of currently active amortization identifiers.
     * @param _pageIndex The zero-based page index used by the pagination helper.
     * @param _pageLength The maximum number of identifiers to return per page.
     * @return activeIds_ The paginated active amortization identifiers.
     */
    function getActiveAmortizationIds(
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (uint256[] memory activeIds_) {
        return _amortizationStorage().activeAmortizationIds.getFromSet(_pageIndex, _pageLength);
    }

    /**
     * @notice Returns the number of currently active amortization identifiers.
     * @return The cardinality of the active amortization-ids set.
     */
    function getTotalActiveAmortizationIds() internal view returns (uint256) {
        return _amortizationStorage().activeAmortizationIds.length();
    }

    /**
     * @notice Reverts with {AmortizationHasActiveHolds} when any holder still has a hold.
     * @dev Used as a guard before executing or finalising an amortization to ensure all
     *      holds have been released first.
     * @param _amortizationID The one-based identifier of the amortization.
     */
    function checkNoActiveAmortizationHolds(uint256 _amortizationID) internal view {
        bytes32 corporateActionId = CorporateActionsStorageWrapper.getCorporateActionIdByTypeIndex(
            CORPORATE_ACTION_TYPE_AMORTIZATION,
            _amortizationID - 1
        );
        if (_amortizationStorage().activeHoldHolders[corporateActionId].length() > 0) {
            revert IAmortization.AmortizationHasActiveHolds(corporateActionId, _amortizationID);
        }
    }

    /**
     * @notice Reverts with {InvalidAmortizationHoldAmount} when the supplied amount is zero.
     * @param _tokenAmount The candidate token amount.
     * @param _amortizationID The one-based identifier of the amortization for the error context.
     */
    function checkPositiveTokenAmount(uint256 _tokenAmount, uint256 _amortizationID) internal pure {
        if (_tokenAmount == 0) revert IAmortization.InvalidAmortizationHoldAmount(_amortizationID);
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
     * @notice Resyncs, values and releases an existing amortization hold, shared by
     *         `setAmortizationHold`'s replacement branch and `releaseAmortizationHold`.
     * @dev Resolves the hold's current ABAF-adjusted amount only after
     *      `HoldStorageWrapper.beforeReleaseHold` has rebased the account/partition
     *      aggregates, then resyncs and decrements `totalHoldByAmortizationId` by that same
     *      amount before actually releasing it. Leaves `AmortizationHoldInfo`/
     *      `activeHoldHolders` bookkeeping to the caller.
     * @param _corporateActionId The amortization corporate action the hold belongs to.
     * @param _tokenHolder The holder whose hold is being released.
     * @param _holdId The hold identifier on the default partition.
     */
    function _releaseExistingHold(bytes32 _corporateActionId, address _tokenHolder, uint256 _holdId) private {
        IHoldTypes.HoldIdentifier memory id_ = IHoldTypes.HoldIdentifier({
            partition: DEFAULT_PARTITION,
            tokenHolder: _tokenHolder,
            holdId: _holdId
        });
        HoldStorageWrapper.beforeReleaseHold(id_);
        uint256 amount = HoldStorageWrapper.getHoldAmountAdjustedAt(id_, TimeTravelStorageWrapper.getBlockTimestamp());
        _syncTotalHoldByAmortizationId(_corporateActionId);
        _amortizationStorage().totalHoldByAmortizationId[_corporateActionId] -= amount;
        _releaseHold(_tokenHolder, _holdId, amount);
    }

    /**
     * @notice Fully removes an amortization hold by writing directly to hold storage.
     * @dev Removes the LABAF entry and emits the standard transfer events to keep
     *      observers in sync.
     * @param _tokenHolder The holder whose hold is being released.
     * @param _holdId The hold identifier on the default partition.
     * @param _amount The amount to release.
     * @return Always true on success; reverts otherwise.
     */
    function _releaseHold(address _tokenHolder, uint256 _holdId, uint256 _amount) private returns (bool) {
        IHoldTypes.HoldIdentifier memory identifier = IHoldTypes.HoldIdentifier({
            partition: DEFAULT_PARTITION,
            tokenHolder: _tokenHolder,
            holdId: _holdId
        });

        HoldStorageWrapper.removeAndTransferHoldBalance(identifier, _amount);

        emit IERC1410Types.TransferByPartition(
            DEFAULT_PARTITION,
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
     * @notice Rebases `totalHoldByAmortizationId[_corporateActionId]` to the current ABAF.
     * @dev Mirrors `HoldStorageWrapper`'s `updateTotalHeldAmountAndLabaf` for this
     *      amortization-scoped aggregate — the only aggregate in this codebase that sums
     *      across multiple accounts rather than living inside one. Must be called immediately
     *      before every increment or decrement of `totalHoldByAmortizationId`, so the running
     *      total is never rebased retroactively across a mixed history of holds created at
     *      different ABAF values, only incrementally at each touchpoint — the same invariant
     *      every other LABAF-tracked aggregate in this codebase already relies on.
     * @param _corporateActionId The amortization corporate action whose aggregate is synced.
     */
    function _syncTotalHoldByAmortizationId(bytes32 _corporateActionId) private {
        uint256 abaf = AdjustBalancesStorageWrapper.getAbaf();
        uint256 labaf = AdjustBalancesStorageWrapper.getAmortizationHoldLabaf(_corporateActionId);
        if (abaf != labaf) {
            _amortizationStorage().totalHoldByAmortizationId[_corporateActionId] *= AdjustBalancesStorageWrapper
                .calculateFactor(abaf, labaf);
            AdjustBalancesStorageWrapper.setAmortizationHoldLabaf(_corporateActionId, abaf);
        }
    }

    function _amortizationStorage() private pure returns (AmortizationDataStorage storage amortizationData_) {
        bytes32 position = STORAGE_LOCATION_AMORTIZATION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            amortizationData_.slot := position
        }
    }
}
