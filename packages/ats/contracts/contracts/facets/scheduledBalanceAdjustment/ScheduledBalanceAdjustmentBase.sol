// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { BALANCE_ADJ_DATA } from "../../constants/values.sol";
import {
    CORPORATE_ACTION_TYPE_BALANCE_ADJUSTMENT,
    SCHEDULED_TASK_TYPE_BALANCE_ADJUSTMENT
} from "../../constants/dispatchTypes.sol";
import { IScheduledBalanceAdjustment } from "../../facets/scheduledBalanceAdjustment/IScheduledBalanceAdjustment.sol";
import { CorporateActionsStorageWrapper } from "../../domain/core/CorporateActionsStorageWrapper.sol";
import { ScheduledTasksStorageWrapper } from "../../domain/asset/ScheduledTasksStorageWrapper.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { _checkUnexpectedError } from "../../infrastructure/utils/UnexpectedError.sol";

/**
 * @title ScheduledBalanceAdjustmentBase
 * @author Asset Tokenization Studio Team
 * @notice Pure business logic for the scheduled balance-adjustment lifecycle, shared by
 *         `ScheduledBalanceAdjustment` and its concrete facet.
 * @dev Coordinates `CorporateActionsStorageWrapper` and `ScheduledTasksStorageWrapper`
 *      without owning any storage slot of its own. Intended to be inherited by concrete
 *      facet contracts — not deployed standalone.
 */
abstract contract ScheduledBalanceAdjustmentBase {
    /**
     * @notice Creates a new scheduled balance adjustment and registers it with the
     *         corporate-action and scheduled-task sub-systems.
     * @param newBalanceAdjustment The adjustment parameters supplied by the caller.
     * @return corporateActionId_   Identifier of the newly created corporate action.
     * @return balanceAdjustmentID_ One-based index of the new balance adjustment.
     */
    function _setScheduledBalanceAdjustment(
        IScheduledBalanceAdjustment.ScheduledBalanceAdjustment calldata newBalanceAdjustment
    ) internal returns (bytes32 corporateActionId_, uint256 balanceAdjustmentID_) {
        bytes memory data = abi.encode(newBalanceAdjustment);

        (corporateActionId_, balanceAdjustmentID_) = CorporateActionsStorageWrapper.addCorporateAction(
            CORPORATE_ACTION_TYPE_BALANCE_ADJUSTMENT,
            data
        );

        _registerBalanceAdjustmentTasks(corporateActionId_, data);
    }

    /**
     * @notice Cancels a previously scheduled balance adjustment that has not yet executed.
     * @dev Reverts with `BalanceAdjustmentAlreadyExecuted` if the execution date has already
     *      elapsed at the current block timestamp.
     * @param balanceAdjustmentId One-based index of the balance adjustment to cancel.
     */
    function _cancelScheduledBalanceAdjustment(uint256 balanceAdjustmentId) internal {
        unchecked {
            CorporateActionsStorageWrapper.requireMatchingActionType(
                CORPORATE_ACTION_TYPE_BALANCE_ADJUSTMENT,
                balanceAdjustmentId - 1
            );
        }
        IScheduledBalanceAdjustment.ScheduledBalanceAdjustment memory balanceAdjustment;
        bytes32 corporateActionId;
        (balanceAdjustment, corporateActionId, ) = _getScheduledBalanceAdjustment(balanceAdjustmentId);
        _requireNotExecuted(balanceAdjustment.executionDate, corporateActionId, balanceAdjustmentId);
        CorporateActionsStorageWrapper.cancelCorporateAction(corporateActionId);
    }

    /**
     * @notice Registers a decoded balance adjustment with the scheduled-task sub-system.
     * @dev Reverts with `BalanceAdjustmentCreationFailed` when `actionId` is zero,
     *      indicating the upstream corporate-action creation failed.
     * @param actionId Corporate-action identifier assigned by the corporate-actions storage.
     * @param data     ABI-encoded `ScheduledBalanceAdjustment` struct.
     */
    function _registerBalanceAdjustmentTasks(bytes32 actionId, bytes memory data) internal {
        _requireValidCorporateActionId(actionId);

        IScheduledBalanceAdjustment.ScheduledBalanceAdjustment memory newBalanceAdjustment = abi.decode(
            data,
            (IScheduledBalanceAdjustment.ScheduledBalanceAdjustment)
        );

        ScheduledTasksStorageWrapper.addScheduledCrossOrderedTask(
            newBalanceAdjustment.executionDate,
            SCHEDULED_TASK_TYPE_BALANCE_ADJUSTMENT
        );
        ScheduledTasksStorageWrapper.addScheduledBalanceAdjustment(newBalanceAdjustment.executionDate, actionId);
    }

    /**
     * @notice Cancels a scheduled balance adjustment unconditionally, bypassing the
     *         already-executed guard.
     * @dev Use when administrative override is required after the execution date has passed.
     * @param balanceAdjustmentId The identifier of the balance adjustment to cancel.
     */
    function _forceCancelScheduledBalanceAdjustment(uint256 balanceAdjustmentId) internal {
        (, bytes32 corporateActionId, ) = _getScheduledBalanceAdjustment(balanceAdjustmentId);
        CorporateActionsStorageWrapper.cancelCorporateAction(corporateActionId);
    }

    /**
     * @notice Reverts if the balance adjustment's execution date has already elapsed.
     * @dev Guards cancellation paths that must not proceed after execution.
     * @param executionDate      Scheduled execution timestamp of the adjustment.
     * @param corporateActionId  Corporate-action identifier, forwarded to the revert.
     * @param balanceAdjustmentId One-based index, forwarded to the revert.
     */
    function _requireNotExecuted(
        uint256 executionDate,
        bytes32 corporateActionId,
        uint256 balanceAdjustmentId
    ) internal view {
        if (executionDate <= TimeTravelStorageWrapper.getBlockTimestamp()) {
            revert IScheduledBalanceAdjustment.BalanceAdjustmentAlreadyExecuted(corporateActionId, balanceAdjustmentId);
        }
    }

    /**
     * @notice Returns the balance adjustment stored at the given one-based index.
     * @param balanceAdjustmentID One-based index of the balance adjustment to retrieve.
     * @return balanceAdjustment_ Decoded adjustment parameters.
     * @return corporateActionId_ Identifier of the underlying corporate action.
     * @return isDisabled_        Whether the corporate action has been cancelled.
     */
    function _getScheduledBalanceAdjustment(
        uint256 balanceAdjustmentID
    )
        internal
        view
        returns (
            IScheduledBalanceAdjustment.ScheduledBalanceAdjustment memory balanceAdjustment_,
            bytes32 corporateActionId_,
            bool isDisabled_
        )
    {
        corporateActionId_ = CorporateActionsStorageWrapper.getCorporateActionIdByTypeIndex(
            CORPORATE_ACTION_TYPE_BALANCE_ADJUSTMENT,
            balanceAdjustmentID - 1
        );

        bytes memory data;
        (, , data, isDisabled_) = CorporateActionsStorageWrapper.getCorporateAction(corporateActionId_);

        _checkUnexpectedError(data.length == 0, BALANCE_ADJ_DATA);
        balanceAdjustment_ = abi.decode(data, (IScheduledBalanceAdjustment.ScheduledBalanceAdjustment));
    }

    /**
     * @notice Reverts if the corporate-action identifier is zero, indicating a failed creation.
     * @param actionId Corporate-action identifier to validate.
     */
    function _requireValidCorporateActionId(bytes32 actionId) internal pure {
        if (actionId == bytes32(0)) {
            revert IScheduledBalanceAdjustment.BalanceAdjustmentCreationFailed();
        }
    }
}
