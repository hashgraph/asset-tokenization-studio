// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

interface IVoting {
    struct Voting {
        uint256 recordDate;
        bytes data;
    }

    struct RegisteredVoting {
        Voting voting;
        uint256 snapshotId;
    }

    struct VotingFor {
        uint256 tokenBalance;
        uint256 recordDate;
        bytes data;
        uint8 decimals;
        bool recordDateReached;
    }

    event VotingSet(
        bytes32 corporateActionId,
        uint256 voteId,
        address indexed operator,
        uint256 indexed recordDate,
        bytes data
    );

    event VotingCancelled(uint256 voteId, address indexed operator);

    error VotingRightsCreationFailed();

    error VotingAlreadyRecorded(bytes32 corporateActionId, uint256 voteId);

    function setVoting(Voting calldata _newVoting) external returns (uint256 voteID_);

    function cancelVoting(uint256 _voteId) external returns (bool success_);

    function getVoting(
        uint256 _voteID
    ) external view returns (RegisteredVoting memory registeredVoting_, bool isDisabled_);

    function getVotingFor(uint256 _voteID, address _account) external view returns (VotingFor memory votingFor_);

    function getVotingCount() external view returns (uint256 votingCount_);

    function getVotingHolders(
        uint256 _voteID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (address[] memory holders_);

    function getTotalVotingHolders(uint256 _voteID) external view returns (uint256);
}
