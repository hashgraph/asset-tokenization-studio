// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _CORPORATE_ACTION_ROLE } from "../../../constants/roles.sol";
import { VOTING_RIGHTS_CORPORATE_ACTION_TYPE } from "../../../constants/values.sol";
import { IVoting } from "./IVoting.sol";
import { Modifiers } from "../../../services/Modifiers.sol";
import { VotingStorageWrapper } from "../../../domain/asset/VotingStorageWrapper.sol";
import { EvmAccessors } from "../../../infrastructure/utils/EvmAccessors.sol";

abstract contract Voting is IVoting, Modifiers {
    function setVoting(
        IVoting.Voting calldata _newVoting
    )
        external
        override
        onlyUnpaused
        onlyRole(_CORPORATE_ACTION_ROLE)
        onlyValidTimestamp(_newVoting.recordDate)
        returns (uint256 voteID_)
    {
        bytes32 corporateActionID;
        (corporateActionID, voteID_) = VotingStorageWrapper.setVoting(_newVoting);
        emit IVoting.VotingSet(
            corporateActionID,
            voteID_,
            EvmAccessors.getMsgSender(),
            _newVoting.recordDate,
            _newVoting.data
        );
    }

    function cancelVoting(
        uint256 _voteId
    ) external override onlyUnpaused onlyRole(_CORPORATE_ACTION_ROLE) returns (bool success_) {
        (success_) = VotingStorageWrapper.cancelVoting(_voteId);
        if (success_) {
            emit IVoting.VotingCancelled(_voteId, EvmAccessors.getMsgSender());
        }
    }

    function getVoting(
        uint256 _voteID
    )
        external
        view
        override
        onlyMatchingActionType(VOTING_RIGHTS_CORPORATE_ACTION_TYPE, _voteID - 1)
        returns (RegisteredVoting memory registeredVoting_, bool isDisabled_)
    {
        (registeredVoting_, , isDisabled_) = VotingStorageWrapper.getVoting(_voteID);
    }

    function getVotingFor(
        uint256 _voteID,
        address _account
    )
        external
        view
        override
        onlyMatchingActionType(VOTING_RIGHTS_CORPORATE_ACTION_TYPE, _voteID - 1)
        returns (VotingFor memory votingFor_)
    {
        return VotingStorageWrapper.getVotingFor(_voteID, _account);
    }

    function getVotingCount() external view override returns (uint256 votingCount_) {
        return VotingStorageWrapper.getVotingCount();
    }

    function getVotingHolders(
        uint256 _voteID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (address[] memory holders_) {
        return VotingStorageWrapper.getVotingHolders(_voteID, _pageIndex, _pageLength);
    }

    function getTotalVotingHolders(uint256 _voteID) external view returns (uint256) {
        return VotingStorageWrapper.getTotalVotingHolders(_voteID);
    }
}
