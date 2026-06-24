// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @title IVotingTypes
/// @notice Voting data structures for token voting mechanisms
interface IVotingTypes {
    /// @notice Voting data structure
    struct Voting {
        uint256 recordDate;
        bytes data;
    }

    /// @notice Registered voting with snapshot information
    struct RegisteredVoting {
        Voting voting;
        uint256 snapshotId;
    }

    /// @notice Voting details for a specific account
    struct VotingFor {
        uint256 tokenBalance;
        uint256 recordDate;
        bytes data;
        uint8 decimals;
        bool recordDateReached;
        bool isDisabled;
    }
}
