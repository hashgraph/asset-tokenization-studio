// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ScheduledTask } from "../layer_2/scheduledTask/scheduledTasksCommon/IScheduledTasksCommon.sol";

/**
 * @title IAdjustBalances
 * @author Asset Tokenization Studio Team
 * @notice Interface for immediate and scheduled balance adjustment corporate actions on tokenised assets.
 * @dev Balance adjustments multiply every token holder's balance by `factor / 10^decimals`. Immediate
 *      adjustments execute synchronously; scheduled ones are enqueued and triggered when their
 *      `executionDate` is reached. Scheduled tasks are managed through `ScheduledTasksStorageWrapper`
 *      and corporate-action records through `EquityStorageWrapper`.
 */
interface IAdjustBalances {
    /**
     * @notice Parameters for a balance adjustment to be scheduled for future execution.
     * @dev `factor` and `decimals` together represent the multiplier: effective ratio = factor / 10^decimals.
     *      `executionDate` must be a future Unix timestamp; zero or past values are rejected by
     *      `onlyValidTimestamp`.
     */
    struct ScheduledBalanceAdjustment {
        uint256 executionDate;
        uint256 factor;
        uint8 decimals;
    }

    /**
     * @notice Emitted when an immediate balance adjustment is applied.
     * @param operator Address that triggered the adjustment.
     * @param factor   Numerator of the adjustment ratio.
     * @param decimals Denominator exponent; effective ratio = factor / 10^decimals.
     */
    event AdjustmentBalanceSet(address indexed operator, uint256 factor, uint8 decimals);

    /**
     * @notice Emitted when a balance adjustment is successfully scheduled.
     * @param corporateActionId   On-chain identifier of the associated corporate action record.
     * @param balanceAdjustmentId Sequential identifier of the scheduled adjustment.
     * @param operator            Address that scheduled the adjustment.
     * @param executionDate       Unix timestamp at which the adjustment will be executed.
     * @param factor              Numerator of the adjustment ratio.
     * @param decimals            Denominator exponent; effective ratio = factor / 10^decimals.
     */
    event ScheduledBalanceAdjustmentSet(
        bytes32 corporateActionId,
        uint256 balanceAdjustmentId,
        address indexed operator,
        uint256 indexed executionDate,
        uint256 factor,
        uint256 decimals
    );

    /**
     * @notice Emitted when a previously scheduled balance adjustment is cancelled.
     * @param balanceAdjustmentId Sequential identifier of the cancelled adjustment.
     * @param operator            Address that performed the cancellation.
     */
    event ScheduledBalanceAdjustmentCancelled(uint256 balanceAdjustmentId, address indexed operator);

    /// @notice Reverts when `factor` is zero, which would zero-out all holder balances.
    error FactorIsZero();

    /// @notice Reverts when the underlying storage layer fails to create a corporate action record.
    error BalanceAdjustmentCreationFailed();

    /**
     * @notice Reverts when attempting to cancel or re-execute an adjustment that has already run.
     * @param corporateActionId   Identifier of the corporate action that was already executed.
     * @param balanceAdjustmentId Identifier of the balance adjustment that was already executed.
     */
    error BalanceAdjustmentAlreadyExecuted(bytes32 corporateActionId, uint256 balanceAdjustmentId);

    /**
     * @notice Applies a balance adjustment to all token holders immediately.
     * @dev Caller must hold `ADJUSTMENT_BALANCE_ROLE`. The token must not be paused and `factor`
     *      must be non-zero. Pending scheduled tasks at index 0 are triggered before the adjustment
     *      is applied, ensuring consistent ordering.
     * @param factor   Numerator of the multiplier; effective ratio = factor / 10^decimals.
     * @param decimals Denominator exponent.
     * @return success_ True if the adjustment was applied without reverting.
     */
    function adjustBalances(uint256 factor, uint8 decimals) external returns (bool success_);

    /**
     * @notice Triggers pending scheduled tasks and synchronises the balance snapshot for a transfer pair.
     * @dev Delegates to `TokenCoreOps.triggerAndSyncAll`. Must be called before any token transfer
     *      that should reflect the latest adjustment state. The token must not be paused.
     * @param _partition Partition identifier of the transfer.
     * @param _from      Sender address whose snapshot is synchronised.
     * @param _to        Recipient address whose snapshot is synchronised.
     */
    function triggerAndSyncAll(bytes32 _partition, address _from, address _to) external;

    /**
     * @notice Enqueues a balance adjustment to be executed at a future date.
     * @dev Caller must hold `CORPORATE_ACTION_ROLE`. The token must not be paused,
     *      `_newBalanceAdjustment.executionDate` must be a future timestamp, and `factor` must be
     *      non-zero. Creates a corporate action record via `EquityStorageWrapper` and emits
     *      `ScheduledBalanceAdjustmentSet`.
     * @param _newBalanceAdjustment Parameters of the adjustment to schedule.
     * @return balanceAdjustmentID_ Sequential identifier assigned to the newly created adjustment.
     */
    function setScheduledBalanceAdjustment(
        ScheduledBalanceAdjustment calldata _newBalanceAdjustment
    ) external returns (uint256 balanceAdjustmentID_);

    /**
     * @notice Cancels a previously scheduled balance adjustment.
     * @dev Caller must hold `CORPORATE_ACTION_ROLE`. The token must not be paused.
     *      Emits `ScheduledBalanceAdjustmentCancelled` on success.
     * @param _balanceAdjustmentID Identifier of the scheduled adjustment to cancel.
     * @return success_ True if the cancellation succeeded.
     */
    function cancelScheduledBalanceAdjustment(uint256 _balanceAdjustmentID) external returns (bool success_);

    /**
     * @notice Returns the parameters and disabled state of a previously scheduled balance adjustment.
     * @dev Reverts if the corporate action type stored at index `_balanceAdjustmentID - 1` does not
     *      match `BALANCE_ADJUSTMENT_CORPORATE_ACTION_TYPE`.
     * @param _balanceAdjustmentID Identifier of the scheduled adjustment to query.
     * @return balanceAdjustment_ Struct containing executionDate, factor, and decimals.
     * @return isDisabled_        True if the adjustment has been cancelled or already executed.
     */
    function getScheduledBalanceAdjustment(
        uint256 _balanceAdjustmentID
    ) external view returns (ScheduledBalanceAdjustment memory balanceAdjustment_, bool isDisabled_);

    /**
     * @notice Returns the total number of balance adjustments ever scheduled, including cancelled ones.
     * @return balanceAdjustmentCount_ Total count of corporate-action balance adjustment records.
     */
    function getBalanceAdjustmentCount() external view returns (uint256 balanceAdjustmentCount_);

    /**
     * @notice Returns the number of pending scheduled balance adjustments in the task queue.
     * @dev Reads directly from `ScheduledTasksStorageWrapper`; excludes already-executed tasks.
     * @return Count of pending balance adjustment tasks.
     */
    function getPendingBalanceAdjustmentCount() external view returns (uint256);

    /**
     * @notice Returns a paginated slice of pending scheduled balance adjustment tasks.
     * @dev Reads from `ScheduledTasksStorageWrapper`. Tasks are ordered by insertion index.
     * @param _pageIndex  Zero-based page number.
     * @param _pageLength Maximum number of tasks to return per page.
     * @return scheduledBalanceAdjustment_ Array of `ScheduledTask` structs for the requested page.
     */
    function getScheduledBalanceAdjustments(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (ScheduledTask[] memory scheduledBalanceAdjustment_);
}
