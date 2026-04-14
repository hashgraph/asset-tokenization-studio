// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IVoting } from "./IVoting.sol";
import { IVotingTypes } from "./IVotingTypes.sol";
import { _CORPORATE_ACTION_ROLE } from "../../../constants/roles.sol";
import { VOTING_RIGHTS_CORPORATE_ACTION_TYPE } from "../../../constants/values.sol";
import { Modifiers } from "../../../services/Modifiers.sol";
import { VotingStorageWrapper } from "../../../domain/asset/voting/VotingStorageWrapper.sol";

/// @title Voting
/// @notice Abstract contract for voting rights management
abstract contract Voting is IVoting, Modifiers {
    /// @notice Sets a new voting for the security
    /// @param _newVoting The new voting to be set
    /// @return voteID_ The created voting identifier
    function setVoting(
        IVotingTypes.Voting calldata _newVoting
    )
        external
        override
        onlyUnpaused
        onlyRole(_CORPORATE_ACTION_ROLE)
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
        onlyUnpaused
        onlyRole(_CORPORATE_ACTION_ROLE)
        onlyMatchingActionType(VOTING_RIGHTS_CORPORATE_ACTION_TYPE, _voteId - 1)
        returns (bool success_)
    {
        success_ = VotingStorageWrapper.cancelVoting(_voteId);
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
        onlyMatchingActionType(VOTING_RIGHTS_CORPORATE_ACTION_TYPE, _voteID - 1)
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
        onlyMatchingActionType(VOTING_RIGHTS_CORPORATE_ACTION_TYPE, _voteID - 1)
        returns (IVotingTypes.VotingFor memory votingFor_)
    {
        return VotingStorageWrapper.getVotingFor(_voteID, _account);
    }

    /// @notice Retrieves the total number of votings
    /// @return votingCount_ The total count of votings
    function getVotingCount() external view override returns (uint256 votingCount_) {
        return VotingStorageWrapper.getVotingCount();
    }

    /// @notice Retrieves the list of token holders for a given voting with pagination
    /// @param _voteID The ID of the voting
    /// @param _pageIndex The page index for pagination
    /// @param _pageLength The page length for pagination
    /// @return holders_ The paginated list of token holder addresses
    function getVotingHolders(
        uint256 _voteID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (address[] memory holders_) {
        return VotingStorageWrapper.getVotingHolders(_voteID, _pageIndex, _pageLength);
    }

    /// @notice Retrieves the total number of token holders for a given voting
    /// @param _voteID The ID of the voting
    /// @return totalHolders_ The total number of token holders at the voting record date
    function getTotalVotingHolders(uint256 _voteID) external view override returns (uint256 totalHolders_) {
        return VotingStorageWrapper.getTotalVotingHolders(_voteID);
    }
}
