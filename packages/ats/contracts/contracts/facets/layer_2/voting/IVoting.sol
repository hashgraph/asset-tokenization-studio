// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IVotingTypes } from "./IVotingTypes.sol";

/// @title IVoting
/// @notice Interface for voting rights management functionality
interface IVoting is IVotingTypes {
    /// @notice Emitted when a voting is set
    /// @param corporateActionId The ID of the corporate action
    /// @param voteId The ID of the voting
    /// @param operator The address of the operator who set the voting
    /// @param recordDate The voting record date
    /// @param data The voting payload
    event VotingSet(
        bytes32 corporateActionId,
        uint256 voteId,
        address indexed operator,
        uint256 indexed recordDate,
        bytes data
    );

    /// @notice Emitted when a voting is cancelled
    /// @param voteId The ID of the cancelled voting
    /// @param operator The address of the operator who cancelled the voting
    event VotingCancelled(uint256 voteId, address indexed operator);

    /// @notice Emitted when an admin force-cancels a voting, bypassing date guards
    /// @param voteId The ID of the force-cancelled voting
    /// @param operator The address of the operator who force-cancelled the voting
    event VotingForceCancelled(uint256 voteId, address indexed operator);

    /// @notice Raised when voting rights creation fails
    error VotingRightsCreationFailed();

    /// @notice Raised when attempting to cancel a voting that has already been recorded
    /// @param corporateActionId The ID of the corporate action
    /// @param voteId The ID of the voting
    error VotingAlreadyRecorded(bytes32 corporateActionId, uint256 voteId);

    /// @notice Sets a new voting for the security
    /// @param _newVoting The new voting to be set
    /// @return voteID_ The created voting identifier
    function setVoting(Voting calldata _newVoting) external returns (uint256 voteID_);

    /// @notice Cancels an existing voting
    /// @param _voteId The ID of the voting to be cancelled
    /// @return success_ Whether the cancellation was successful
    function cancelVoting(uint256 _voteId) external returns (bool success_);

    /// @notice Force-cancels a voting regardless of its record date
    /// @dev Restricted to `CORPORATE_ACTION_CANCEL_ADMIN_ROLE` and gated by the unpaused state
    ///      and `onlyMatchingActionType`. Marks the corporate action disabled unconditionally —
    ///      bypasses `VotingAlreadyRecorded` — and emits `VotingForceCancelled`.
    /// @param _voteId The ID of the voting to force-cancel
    /// @return success_ Whether the force-cancellation was successful
    function forceCancelVoting(uint256 _voteId) external returns (bool success_);

    /// @notice Retrieves a registered voting by its ID
    /// @param _voteID The ID of the voting to retrieve
    /// @return registeredVoting_ The registered voting data
    /// @return isDisabled_ Whether the voting is disabled
    function getVoting(
        uint256 _voteID
    ) external view returns (RegisteredVoting memory registeredVoting_, bool isDisabled_);

    /// @notice Retrieves voting information for a specific account and voting ID
    /// @dev Return value includes user balance at voting record date
    /// @param _voteID The ID of the voting
    /// @param _account The account address
    /// @return votingFor_ Voting information for the specified account
    function getVotingFor(uint256 _voteID, address _account) external view returns (VotingFor memory votingFor_);

    /// @notice Retrieves the total number of votings
    /// @return votingCount_ The total count of votings
    function getVotingCount() external view returns (uint256 votingCount_);
}
