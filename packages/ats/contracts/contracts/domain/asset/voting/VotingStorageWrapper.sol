// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    VOTING_RIGHTS_CORPORATE_ACTION_TYPE,
    SNAPSHOT_RESULT_ID,
    SNAPSHOT_TASK_TYPE
} from "../../../constants/values.sol";
import { CorporateActionsStorageWrapper } from "../../core/CorporateActionsStorageWrapper.sol";
import { ERC1410StorageWrapper } from "../ERC1410StorageWrapper.sol";
import { ERC20StorageWrapper } from "../ERC20StorageWrapper.sol";
import { ERC3643StorageWrapper } from "../../core/ERC3643StorageWrapper.sol";
import { EvmAccessors } from "../../../infrastructure/utils/EvmAccessors.sol";
import { IVoting } from "../../../facets/layer_2/voting/IVoting.sol";
import { IVotingTypes } from "../../../facets/layer_2/voting/IVotingTypes.sol";
import { ScheduledTasksStorageWrapper } from "../ScheduledTasksStorageWrapper.sol";
import { SnapshotsStorageWrapper } from "../SnapshotsStorageWrapper.sol";
import { TimeTravelStorageWrapper } from "../../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";

/**
 * @title VotingStorageWrapper
 * @notice Library providing internal functions to manage voting rights corporate actions,
 *         including creation, cancellation, retrieval, and snapshot balance lookup.
 * @dev All functions are internal and designed to be called by facet contracts. Relies on
 *      CorporateActionsStorageWrapper, ScheduledTasksStorageWrapper, SnapshotsStorageWrapper,
 *      and TimeTravelStorageWrapper for storage and scheduling. Emits events from the IVoting
 *      interface. Reverts with IVoting errors on invalid operations.
 * @author Asset Tokenization Studio Team
 */
library VotingStorageWrapper {
    /**
     * @notice Creates a new voting-rights corporate action and schedules its snapshot task.
     * @dev Encodes `newVoting`, delegates creation to
     *      `CorporateActionsStorageWrapper.addCorporateAction`, and calls `initVotingRights` to
     *      register the record-date snapshot. Emits `IVoting.VotingSet`.
     * @param newVoting        Voting parameters including record date and data payload.
     * @return corporateActionId_ Identifier of the underlying corporate action.
     * @return voteID_            One-indexed identifier of the newly created voting event.
     */
    function setVoting(
        IVotingTypes.Voting calldata newVoting
    ) internal returns (bytes32 corporateActionId_, uint256 voteID_) {
        bytes memory data = abi.encode(newVoting);

        (corporateActionId_, voteID_) = CorporateActionsStorageWrapper.addCorporateAction(
            VOTING_RIGHTS_CORPORATE_ACTION_TYPE,
            data
        );

        initVotingRights(corporateActionId_, data);

        emit IVoting.VotingSet(
            corporateActionId_,
            voteID_,
            EvmAccessors.getMsgSender(),
            newVoting.recordDate,
            newVoting.data
        );
    }

    /**
     * @notice Cancels a pending voting event, enforcing that the record date has not yet been
     *         reached.
     * @dev Reverts with `IVoting.VotingAlreadyRecorded` if the record date is in the past.
     *      Delegates the cancellation to `CorporateActionsStorageWrapper.cancelCorporateAction`.
     *      Emits `IVoting.VotingCancelled`.
     * @param voteId    The identifier of the voting event to cancel.
     * @return success_ Always true if no revert occurred.
     */
    function cancelVoting(uint256 voteId) internal returns (bool success_) {
        (IVoting.RegisteredVoting memory registeredVoting, bytes32 corporateActionId, ) = getVoting(voteId);

        if (registeredVoting.voting.recordDate <= TimeTravelStorageWrapper.getBlockTimestamp()) {
            revert IVoting.VotingAlreadyRecorded(corporateActionId, voteId);
        }

        CorporateActionsStorageWrapper.cancelCorporateAction(corporateActionId);
        success_ = true;

        emit IVoting.VotingCancelled(voteId, EvmAccessors.getMsgSender());
    }

    /**
     * @notice Cancels a voting unconditionally, bypassing the record-date guard.
     * @dev Use when administrative override is required after the record date has passed.
     *      Delegates to `CorporateActionsStorageWrapper.cancelCorporateAction` directly.
     * @param voteId The identifier of the voting to cancel.
     * @return success_ Always true if no revert occurred.
     */
    function forceCancelVoting(uint256 voteId) internal returns (bool success_) {
        (, bytes32 corporateActionId, ) = getVoting(voteId);
        CorporateActionsStorageWrapper.cancelCorporateAction(corporateActionId);
        success_ = true;
    }

    /**
     * @notice Schedules the snapshot task for a newly created voting-rights corporate action.
     * @dev Decodes `data` into `IVotingTypes.Voting` and registers a cross-ordered snapshot task
     *      at `newVoting.recordDate` via `ScheduledTasksStorageWrapper`. Reverts with
     *      `IVoting.VotingRightsCreationFailed` if `actionId` is zero.
     * @param actionId The corporate action identifier (must be non-zero).
     * @param data     ABI-encoded `IVotingTypes.Voting` struct.
     */
    function initVotingRights(bytes32 actionId, bytes memory data) internal {
        if (actionId == bytes32(0)) {
            revert IVoting.VotingRightsCreationFailed();
        }

        IVotingTypes.Voting memory newVoting = abi.decode(data, (IVotingTypes.Voting));

        ScheduledTasksStorageWrapper.addScheduledCrossOrderedTask(newVoting.recordDate, SNAPSHOT_TASK_TYPE);
        ScheduledTasksStorageWrapper.addScheduledSnapshot(newVoting.recordDate, actionId);
    }

    /**
     * @notice Retrieves the registered voting record, corporate action ID, and disabled status.
     * @dev Resolves the corporate action ID by type index, decodes the stored bytes, and reads
     *      the snapshot result ID. Uses `assert` to enforce non-empty data — panics on storage
     *      inconsistency.
     * @param voteID               The one-indexed voting identifier.
     * @return registeredVoting_   Decoded voting struct plus snapshot ID.
     * @return corporateActionId_  Underlying corporate action identifier.
     * @return isDisabled_         True if the voting event has been cancelled.
     */
    function getVoting(
        uint256 voteID
    )
        internal
        view
        returns (IVoting.RegisteredVoting memory registeredVoting_, bytes32 corporateActionId_, bool isDisabled_)
    {
        corporateActionId_ = CorporateActionsStorageWrapper.getCorporateActionIdByTypeIndex(
            VOTING_RIGHTS_CORPORATE_ACTION_TYPE,
            voteID - 1
        );

        bytes memory data;
        (, , data, isDisabled_) = CorporateActionsStorageWrapper.getCorporateAction(corporateActionId_);

        assert(data.length > 0);
        (registeredVoting_.voting) = abi.decode(data, (IVotingTypes.Voting));

        registeredVoting_.snapshotId = CorporateActionsStorageWrapper.getUintResultAt(
            corporateActionId_,
            SNAPSHOT_RESULT_ID
        );
    }

    /**
     * @notice Returns the per-account view of a voting event, including snapshot balance at the
     *         record date.
     * @dev Populates `votingFor_` with the record date, data payload, disabled flag, and the
     *      holder's balance and decimals resolved via `_getSnapshotBalanceForIfDateReached`.
     * @param voteID      The one-indexed identifier of the voting event.
     * @param account     The holder address to inspect.
     * @return votingFor_ Aggregated view of the voting event for the account.
     */
    function getVotingFor(
        uint256 voteID,
        address account
    ) internal view returns (IVotingTypes.VotingFor memory votingFor_) {
        (IVoting.RegisteredVoting memory registeredVoting, , bool isDisabled_) = getVoting(voteID);

        votingFor_.recordDate = registeredVoting.voting.recordDate;
        votingFor_.data = registeredVoting.voting.data;
        votingFor_.isDisabled = isDisabled_;

        (
            votingFor_.tokenBalance,
            votingFor_.decimals,
            votingFor_.recordDateReached
        ) = _getSnapshotBalanceForIfDateReached(
            registeredVoting.voting.recordDate,
            registeredVoting.snapshotId,
            account
        );
    }

    /**
     * @notice Returns the total number of voting-rights corporate actions ever created.
     * @dev Delegates to `CorporateActionsStorageWrapper.getCorporateActionCountByType`.
     * @return votingCount_ Total count of registered voting events.
     */
    function getVotingCount() internal view returns (uint256 votingCount_) {
        return CorporateActionsStorageWrapper.getCorporateActionCountByType(VOTING_RIGHTS_CORPORATE_ACTION_TYPE);
    }

    /**
     * @notice Returns a paginated list of token holders eligible to participate in a voting event.
     * @dev Returns an empty array before the record date. After the record date, holders are
     *      sourced from the bound snapshot when one exists, otherwise from the live ERC1410
     *      holder set.
     * @param voteID     The one-indexed identifier of the voting event.
     * @param pageIndex  Zero-based page index.
     * @param pageLength Maximum number of addresses per page.
     * @return holders_  Paginated array of eligible holder addresses.
     */
    function getVotingHolders(
        uint256 voteID,
        uint256 pageIndex,
        uint256 pageLength
    ) internal view returns (address[] memory holders_) {
        (IVoting.RegisteredVoting memory registeredVoting, , ) = getVoting(voteID);

        if (registeredVoting.voting.recordDate >= TimeTravelStorageWrapper.getBlockTimestamp()) return holders_;

        if (registeredVoting.snapshotId != 0)
            return SnapshotsStorageWrapper.tokenHoldersAt(registeredVoting.snapshotId, pageIndex, pageLength);

        return ERC1410StorageWrapper.getTokenHolders(pageIndex, pageLength);
    }

    /**
     * @notice Returns the total number of holders eligible to participate in a voting event.
     * @dev Mirrors `getVotingHolders` logic but returns a count. Returns zero before the record
     *      date.
     * @param voteID The one-indexed identifier of the voting event.
     * @return Total number of eligible holders.
     */
    function getTotalVotingHolders(uint256 voteID) internal view returns (uint256) {
        (IVoting.RegisteredVoting memory registeredVoting, , ) = getVoting(voteID);

        if (registeredVoting.voting.recordDate >= TimeTravelStorageWrapper.getBlockTimestamp()) return 0;

        if (registeredVoting.snapshotId != 0)
            return SnapshotsStorageWrapper.totalTokenHoldersAt(registeredVoting.snapshotId);

        return ERC1410StorageWrapper.getTotalTokenHolders();
    }

    /**
     * @notice Returns a holder's token balance and decimals at `date`, if `date` has already
     *         passed.
     * @dev Returns zeros and `false` when `date` is still in the future. Balance and decimals are
     *      sourced from the bound snapshot (if `snapshotId != 0`) or from ABAF-adjusted ERC3643
     *      and ERC20 storage at `date`.
     * @param date       The reference timestamp to compare against the current block.
     * @param snapshotId Snapshot identifier (zero means no snapshot is bound).
     * @param account    The holder address to query.
     * @return balance_     Token balance of `account` at `date`, or zero.
     * @return decimals_    Token decimals at `date`, or zero.
     * @return dateReached_ True if `date` is in the past.
     */
    function _getSnapshotBalanceForIfDateReached(
        uint256 date,
        uint256 snapshotId,
        address account
    ) private view returns (uint256 balance_, uint8 decimals_, bool dateReached_) {
        if (date >= TimeTravelStorageWrapper.getBlockTimestamp()) return (balance_, decimals_, dateReached_);
        dateReached_ = true;

        balance_ = (snapshotId != 0)
            ? SnapshotsStorageWrapper.getTotalBalanceOfAtSnapshot(snapshotId, account)
            : ERC3643StorageWrapper.getTotalBalanceForAdjustedAt(account, date);

        decimals_ = (snapshotId != 0)
            ? SnapshotsStorageWrapper.decimalsAtSnapshot(snapshotId)
            : ERC20StorageWrapper.decimalsAdjustedAt(date);
    }
}
