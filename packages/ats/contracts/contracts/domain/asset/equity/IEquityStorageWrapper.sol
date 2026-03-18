// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

interface IEquityStorageWrapper {
    event ScheduledBalanceAdjustmentSet(
        bytes32 corporateActionId,
        uint256 balanceAdjustmentId,
        address indexed operator,
        uint256 indexed executionDate,
        uint256 factor,
        uint256 decimals
    );

    /**
     * @notice Emitted when a scheduled balance adjustment is cancelled.
     * @param balanceAdjustmentId Identifier of the cancelled scheduled balance adjustment.
     * @param operator Address that performed the cancellation.
     */
    event ScheduledBalanceAdjustmentCancelled(uint256 balanceAdjustmentId, address indexed operator);
    error BalanceAdjustmentCreationFailed();
    error BalanceAdjustmentAlreadyExecuted(bytes32 corporateActionId, uint256 balanceAdjustmentId);
}
