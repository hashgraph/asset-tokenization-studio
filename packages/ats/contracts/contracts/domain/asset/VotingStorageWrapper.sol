// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { SNAPSHOT_RESULT_ID } from "../../constants/values.sol";
import { CORPORATE_ACTION_TYPE_VOTING_RIGHTS, SCHEDULED_TASK_TYPE_SNAPSHOT } from "../../constants/dispatchTypes.sol";
import { CorporateActionsStorageWrapper } from "../core/CorporateActionsStorageWrapper.sol";
import { ERC1410StorageWrapper } from "./ERC1410StorageWrapper.sol";
import { ERC20StorageWrapper } from "./ERC20StorageWrapper.sol";
import { TokenCoreOps } from "../orchestrator/TokenCoreOps.sol";
import { IVoting } from "../../facets/voting/IVoting.sol";
import { IVotingTypes } from "../../facets/voting/IVotingTypes.sol";
import { ScheduledTasksStorageWrapper } from "./ScheduledTasksStorageWrapper.sol";
import { SnapshotsStorageWrapper } from "./SnapshotsStorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
/**
 * @title VotingStorageWrapper
 * @notice Library providing internal functions to manage voting rights corporate actions,
 *         including creation, cancellation, retrieval, and snapshot balance lookup.
 * @dev All functions are internal and designed to be called by facet contracts. Relies on
 *      CorporateActionsStorageWrapper, ScheduledTasksStorageWrapper, SnapshotsStorageWrapper,
 *      and EvmAccessors for storage and scheduling. Emits events from the IVoting
 *      interface. Reverts with IVoting errors on invalid operations.
 * @author Asset Tokenization Studio Team
 */
library VotingStorageWrapper {
    /**
     * @notice Registers a new voting-rights corporate action and schedules its snapshot.
     * @dev Encodes the voting payload, delegates id allocation to
     *      `CorporateActionsStorageWrapper.addCorporateAction`, then wires the record-date
     *      snapshot via `initVotingRights`. The calling facet (`Voting`) emits `IVoting.VotingSet`.
     * @param newVoting Voting parameters supplied by the caller.
     * @return corporateActionId_ Identifier of the newly registered corporate action.
     * @return voteID_            One-based index of the voting action within its type bucket.
     */
    function setVoting(
        IVotingTypes.Voting calldata newVoting
    ) internal returns (bytes32 corporateActionId_, uint256 voteID_) {
        bytes memory data = abi.encode(newVoting);

        (corporateActionId_, voteID_) = CorporateActionsStorageWrapper.addCorporateAction(
            CORPORATE_ACTION_TYPE_VOTING_RIGHTS,
            data
        );

        initVotingRights(corporateActionId_, data);
    }

    /**
     * @notice Cancels an existing voting-rights corporate action prior to its record date.
     * @dev Reverts with `IVoting.VotingAlreadyRecorded` once the record date has been reached;
     *      otherwise delegates the cancellation to
     *      `CorporateActionsStorageWrapper.cancelCorporateAction`. The calling facet (`Voting`)
     *      emits `IVoting.VotingCancelled`.
     * @param voteId One-based vote identifier within the voting-rights bucket.
     * @return success_ Always true on a successful path (revert otherwise).
     */
    function cancelVoting(uint256 voteId) internal returns (bool success_) {
        (IVoting.RegisteredVoting memory registeredVoting, bytes32 corporateActionId, ) = getVoting(voteId);

        if (registeredVoting.voting.recordDate <= EvmAccessors.getBlockTimestamp()) {
            revert IVoting.VotingAlreadyRecorded(corporateActionId, voteId);
        }

        _executeCancelVoting(corporateActionId);
        success_ = true;
    }

    /**
     * @notice Cancels a voting unconditionally, bypassing the record-date guard.
     * @dev Use when administrative override is required after the record date has passed.
     *      Delegates to `_executeCancelVoting` directly.
     * @param voteId The identifier of the voting to cancel.
     * @return success_ Always true if no revert occurred.
     */
    function forceCancelVoting(uint256 voteId) internal returns (bool success_) {
        (, bytes32 corporateActionId, ) = getVoting(voteId);
        _executeCancelVoting(corporateActionId);
        success_ = true;
    }

    /**
     * @notice Wires the snapshot scheduling for a newly registered voting-rights action.
     * @dev Reverts with `IVoting.VotingRightsCreationFailed` when `actionId` is zero. Adds two
     *      cross-ordered scheduled tasks: a generic snapshot task and the snapshot bound to
     *      the corporate action so the record-date balances can be queried later.
     * @param actionId Corporate-action identifier returned by the storage wrapper.
     * @param data     ABI-encoded `IVotingTypes.Voting` payload used to read the record date.
     */
    function initVotingRights(bytes32 actionId, bytes memory data) internal {
        if (actionId == bytes32(0)) {
            revert IVoting.VotingRightsCreationFailed();
        }

        IVotingTypes.Voting memory newVoting = abi.decode(data, (IVotingTypes.Voting));

        ScheduledTasksStorageWrapper.addScheduledCrossOrderedTask(newVoting.recordDate, SCHEDULED_TASK_TYPE_SNAPSHOT);
        ScheduledTasksStorageWrapper.addScheduledSnapshot(newVoting.recordDate, actionId);
    }

    /**
     * @notice Returns the registered voting payload, action id, and disabled flag for a vote.
     * @dev Resolves the corporate-action id via the voting-rights bucket and decodes the
     *      stored data into a `RegisteredVoting`. Reads the resolved snapshot id from the
     *      action's uint result map keyed by `SNAPSHOT_RESULT_ID`.
     * @param voteID One-based vote identifier within the voting-rights bucket.
     * @return registeredVoting_ Decoded voting payload plus the resolved snapshot id.
     * @return corporateActionId_ Identifier of the backing corporate action.
     * @return isDisabled_ True when the corporate action has been cancelled.
     */
    function getVoting(
        uint256 voteID
    )
        internal
        view
        returns (IVoting.RegisteredVoting memory registeredVoting_, bytes32 corporateActionId_, bool isDisabled_)
    {
        corporateActionId_ = CorporateActionsStorageWrapper.getCorporateActionIdByTypeIndex(
            CORPORATE_ACTION_TYPE_VOTING_RIGHTS,
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
     * @notice Aggregates the per-account voting view for a registered voting action.
     * @dev Combines the static voting payload with the account-specific snapshot balance and
     *      decimals, computed only if the record date has been reached.
     * @param voteID  One-based vote identifier within the voting-rights bucket.
     * @param account Address whose voting balance is being projected.
     * @return votingFor_ Composite voting view, including balance, decimals, and record-date
     *                    reached flag.
     */
    function getVotingFor(
        uint256 voteID,
        address account
    ) internal view returns (IVotingTypes.VotingFor memory votingFor_) {
        (IVoting.RegisteredVoting memory registeredVoting, , bool isDisabled_) = getVoting(voteID);

        votingFor_.recordDate = registeredVoting.voting.recordDate;
        votingFor_.data = registeredVoting.voting.data;
        votingFor_.isDisabled = isDisabled_;

        (votingFor_.tokenBalance, votingFor_.decimals, votingFor_.recordDateReached) = SnapshotsStorageWrapper
            .getSnapshotTakenBalance(registeredVoting.voting.recordDate, registeredVoting.snapshotId, account);
    }

    /**
     * @notice Returns the total number of voting-rights corporate actions registered.
     * @return votingCount_ Count of voting-rights actions in the corporate-action bucket.
     */
    function getVotingCount() internal view returns (uint256 votingCount_) {
        return CorporateActionsStorageWrapper.getCorporateActionCountByType(CORPORATE_ACTION_TYPE_VOTING_RIGHTS);
    }

    /**
     * @notice Returns a paged list of token holders eligible to vote on the action.
     * @dev Falls back to the live ERC1410 holder enumeration when no snapshot has been
     *      captured. Returns an empty page when the record date has not yet been reached.
     * @param voteID     One-based vote identifier within the voting-rights bucket.
     * @param pageIndex  Zero-based page index for paginated enumeration.
     * @param pageLength Page size used by the underlying enumeration.
     * @return holders_ Page of eligible voter addresses.
     */
    function getVotingHolders(
        uint256 voteID,
        uint256 pageIndex,
        uint256 pageLength
    ) internal view returns (address[] memory holders_) {
        (IVoting.RegisteredVoting memory registeredVoting, , ) = getVoting(voteID);

        if (registeredVoting.voting.recordDate >= EvmAccessors.getBlockTimestamp()) return holders_;

        if (registeredVoting.snapshotId != 0)
            return SnapshotsStorageWrapper.tokenHoldersAt(registeredVoting.snapshotId, pageIndex, pageLength);

        return ERC1410StorageWrapper.getTokenHolders(pageIndex, pageLength);
    }

    /**
     * @notice Returns the total number of token holders eligible to vote on the action.
     * @dev Mirrors `getVotingHolders` but returns the count; falls back to the live ERC1410
     *      total when no snapshot is bound, zero if the record date has not yet been reached.
     * @param voteID One-based vote identifier within the voting-rights bucket.
     * @return uint256 Total eligible holder count.
     */
    function getTotalVotingHolders(uint256 voteID) internal view returns (uint256) {
        (IVoting.RegisteredVoting memory registeredVoting, , ) = getVoting(voteID);

        if (registeredVoting.voting.recordDate >= EvmAccessors.getBlockTimestamp()) return 0;

        if (registeredVoting.snapshotId != 0)
            return SnapshotsStorageWrapper.totalTokenHoldersAt(registeredVoting.snapshotId);

        return ERC1410StorageWrapper.getTotalTokenHolders();
    }

    /**
     * @notice Resolves the account's snapshot balance and decimals when the record date is met.
     * @dev Returns zeroed outputs and `dateReached_ == false` while the record date is in the
     *      future. When a snapshot is bound, queries the snapshot store; otherwise reads the
     *      adjusted ERC3643 balance and live ERC20 decimals at `date`.
     * @param date       Record date being checked against the current block timestamp.
     * @param snapshotId Snapshot identifier bound to the voting action (zero when none).
     * @param account    Address whose balance is being projected.
     * @return balance_     Account balance at the resolved point in time.
     * @return decimals_    Token decimals at the resolved point in time.
     * @return dateReached_ True when the record date has been reached.
     */
    /**
     * @notice Performs the storage write that cancels a voting corporate action.
     * @param corporateActionId The corporate-action identifier linked to the voting.
     */
    function _executeCancelVoting(bytes32 corporateActionId) private {
        CorporateActionsStorageWrapper.cancelCorporateAction(corporateActionId);
    }
}
