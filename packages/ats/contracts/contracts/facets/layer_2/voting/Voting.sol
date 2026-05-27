// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IVoting } from "./IVoting.sol";
import { IVotingTypes } from "./IVotingTypes.sol";
import { ROLE_CORPORATE_ACTION, ROLE_CORPORATE_ACTION_FORCE_CANCEL } from "../../../constants/roles.sol";
import { CORPORATE_ACTION_TYPE_VOTING_RIGHTS } from "../../../constants/dispatchTypes.sol";
import { Modifiers } from "../../../services/Modifiers.sol";
import { EvmAccessors } from "../../../infrastructure/utils/EvmAccessors.sol";
import { VotingStorageWrapper } from "../../../domain/asset/VotingStorageWrapper.sol";

/// @title Voting
/// @author Asset Tokenization Studio Team
/// @notice Abstract facet implementing the voting-rights corporate action lifecycle.
/// @dev Delegates persistence to `VotingStorageWrapper`; access is gated by
///      `ROLE_CORPORATE_ACTION` and the standard activation/pause modifiers.
abstract contract Voting is IVoting, Modifiers {
    /// @notice Sets a new voting for the security
    /// @param _newVoting The new voting to be set
    /// @return voteID_ The created voting identifier
    function setVoting(
        IVotingTypes.Voting calldata _newVoting
    )
        external
        override
        onlyActivated
        onlyUnpaused
        onlyRole(ROLE_CORPORATE_ACTION)
        onlyValidTimestamp(_newVoting.recordDate)
        returns (uint256 voteID_)
    {
        (, voteID_) = VotingStorageWrapper.setVoting(_newVoting);
    }

    /// @notice Cancels an existing voting
    /// @param _voteId The ID of the voting to be cancelled
    /// @return success_ Whether the cancellation was successful
    function cancelVoting(
        uint256 _voteId
    )
        external
        override
        onlyActivated
        onlyUnpaused
        onlyRole(ROLE_CORPORATE_ACTION)
        onlyMatchingActionType(CORPORATE_ACTION_TYPE_VOTING_RIGHTS, _voteId - 1)
        returns (bool success_)
    {
        success_ = VotingStorageWrapper.cancelVoting(_voteId);
    }

    /// @inheritdoc IVoting
    /// @dev Restricted to `ROLE_CORPORATE_ACTION_FORCE_CANCEL`; gated by `onlyUnpaused` and
    ///      `onlyMatchingActionType(CORPORATE_ACTION_TYPE_VOTING_RIGHTS, _voteId - 1)`.
    function forceCancelVoting(
        uint256 _voteId
    )
        external
        override
        onlyActivated
        onlyUnpaused
        onlyRole(ROLE_CORPORATE_ACTION_FORCE_CANCEL)
        onlyMatchingActionType(CORPORATE_ACTION_TYPE_VOTING_RIGHTS, _voteId - 1)
        returns (bool success_)
    {
        success_ = VotingStorageWrapper.forceCancelVoting(_voteId);
        emit IVoting.VotingForceCancelled(_voteId, EvmAccessors.getMsgSender());
    }

    /// @notice Retrieves a registered voting by its ID
    /// @param _voteID The ID of the voting to retrieve
    /// @return registeredVoting_ The registered voting data
    /// @return isDisabled_ Whether the voting is disabled
    function getVoting(
        uint256 _voteID
    )
        external
        view
        override
        onlyMatchingActionType(CORPORATE_ACTION_TYPE_VOTING_RIGHTS, _voteID - 1)
        returns (IVotingTypes.RegisteredVoting memory registeredVoting_, bool isDisabled_)
    {
        (registeredVoting_, , isDisabled_) = VotingStorageWrapper.getVoting(_voteID);
    }

    /// @notice Retrieves voting information for a specific account and voting ID
    /// @param _voteID The ID of the voting
    /// @param _account The account address
    /// @return votingFor_ Voting information for the specified account
    function getVotingFor(
        uint256 _voteID,
        address _account
    )
        external
        view
        override
        onlyMatchingActionType(CORPORATE_ACTION_TYPE_VOTING_RIGHTS, _voteID - 1)
        returns (IVotingTypes.VotingFor memory votingFor_)
    {
        return VotingStorageWrapper.getVotingFor(_voteID, _account);
    }

    /// @notice Retrieves the total number of votings
    /// @return votingCount_ The total count of votings
    function getVotingCount() external view override returns (uint256 votingCount_) {
        return VotingStorageWrapper.getVotingCount();
    }
}
