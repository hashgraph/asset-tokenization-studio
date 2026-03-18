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

    event ScheduledBalanceAdjustmentSet(
        bytes32 corporateActionId,
        uint256 balanceAdjustmentId,
        address indexed operator,
        uint256 indexed executionDate,
        uint256 factor,
        uint256 decimals
    );

    /**
     * @notice Emitted when a voting is cancelled.
     * @param voteId Identifier of the cancelled voting.
     * @param operator Address that performed the cancellation.
     */
    event VotingCancelled(uint256 voteId, address indexed operator);

    /**
     * @notice Emitted when a scheduled balance adjustment is cancelled.
     * @param balanceAdjustmentId Identifier of the cancelled scheduled balance adjustment.
     * @param operator Address that performed the cancellation.
     */
    event ScheduledBalanceAdjustmentCancelled(uint256 balanceAdjustmentId, address indexed operator);

    error VotingRightsCreationFailed();
    error BalanceAdjustmentCreationFailed();
    error VotingAlreadyRecorded(bytes32 corporateActionId, uint256 voteId);
    error BalanceAdjustmentAlreadyExecuted(bytes32 corporateActionId, uint256 balanceAdjustmentId);
}
