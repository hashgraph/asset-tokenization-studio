// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

interface IVotingStorageWrapper {
    event VotingSet(
        bytes32 corporateActionId,
        uint256 voteId,
        address indexed operator,
        uint256 indexed recordDate,
        bytes data
    );

    /**
     * @notice Emitted when a voting is cancelled.
     * @param voteId Identifier of the cancelled voting.
     * @param operator Address that performed the cancellation.
     */
    event VotingCancelled(uint256 voteId, address indexed operator);

    error VotingRightsCreationFailed();
    error VotingAlreadyRecorded(bytes32 corporateActionId, uint256 voteId);
}
