// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

interface IEquityStorageWrapper {
    event VotingSet(
        bytes32 corporateActionId,
        uint256 voteId,
        address indexed operator,
        uint256 indexed recordDate,
        bytes data
    );

    event DividendSet(
        bytes32 corporateActionId,
        uint256 dividendId,
        address indexed operator,
        uint256 indexed recordDate,
        uint256 indexed executionDate,
        uint256 amount
    );

    error DividendCreationFailed();
    error VotingRightsCreationFailed();
}
