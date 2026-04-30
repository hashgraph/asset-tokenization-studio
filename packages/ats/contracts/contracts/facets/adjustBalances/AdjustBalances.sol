// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IAdjustBalances } from "./IAdjustBalances.sol";
import { ADJUSTMENT_BALANCE_ROLE, CORPORATE_ACTION_ROLE } from "../../constants/roles.sol";
import { BALANCE_ADJUSTMENT_CORPORATE_ACTION_TYPE } from "../../constants/values.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { AdjustBalancesStorageWrapper } from "../../domain/asset/AdjustBalancesStorageWrapper.sol";
import { CorporateActionsStorageWrapper } from "../../domain/core/CorporateActionsStorageWrapper.sol";
import { EquityStorageWrapper } from "../../domain/asset/EquityStorageWrapper.sol";
import { ScheduledTasksStorageWrapper } from "../../domain/asset/ScheduledTasksStorageWrapper.sol";
import { TokenCoreOps } from "../../domain/orchestrator/TokenCoreOps.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { ScheduledTask } from "../layer_2/scheduledTask/scheduledTasksCommon/IScheduledTasksCommon.sol";

/**
 * @title AdjustBalances
 * @author Asset Tokenization Studio Team
 * @notice Abstract implementation of `IAdjustBalances` providing immediate and scheduled
 *         balance adjustment corporate actions for tokenised assets.
 * @dev Inherits access-control guards from `Modifiers`. Immediate adjustments are applied via
 *      `AdjustBalancesStorageWrapper`; scheduled ones are managed through `EquityStorageWrapper`
 *      and `ScheduledTasksStorageWrapper`. Intended to be inherited by `AdjustBalancesFacet`.
 */
abstract contract AdjustBalances is IAdjustBalances, Modifiers {
    /// @inheritdoc IAdjustBalances
    function adjustBalances(
        uint256 factor,
        uint8 decimals
    ) external override onlyUnpaused onlyRole(ADJUSTMENT_BALANCE_ROLE) onlyValidFactor(factor) returns (bool success_) {
        ScheduledTasksStorageWrapper.triggerScheduledCrossOrderedTasks(0);
        AdjustBalancesStorageWrapper.adjustBalances(factor, decimals);
        success_ = true;
    }

    /// @inheritdoc IAdjustBalances
    function triggerAndSyncAll(bytes32 _partition, address _from, address _to) external override onlyUnpaused {
        TokenCoreOps.triggerAndSyncAll(_partition, _from, _to);
    }

    /// @inheritdoc IAdjustBalances
    function setScheduledBalanceAdjustment(
        IAdjustBalances.ScheduledBalanceAdjustment calldata _newBalanceAdjustment
    )
        external
        override
        onlyUnpaused
        onlyRole(CORPORATE_ACTION_ROLE)
        onlyValidTimestamp(_newBalanceAdjustment.executionDate)
        onlyValidFactor(_newBalanceAdjustment.factor)
        returns (uint256 balanceAdjustmentID_)
    {
        bytes32 corporateActionID;
        (corporateActionID, balanceAdjustmentID_) = EquityStorageWrapper.setScheduledBalanceAdjustment(
            _newBalanceAdjustment
        );
        emit IAdjustBalances.ScheduledBalanceAdjustmentSet(
            corporateActionID,
            balanceAdjustmentID_,
            EvmAccessors.getMsgSender(),
            _newBalanceAdjustment.executionDate,
            _newBalanceAdjustment.factor,
            _newBalanceAdjustment.decimals
        );
    }

    /// @inheritdoc IAdjustBalances
    function cancelScheduledBalanceAdjustment(
        uint256 _balanceAdjustmentId
    )
        external
        override
        onlyUnpaused
        onlyRole(CORPORATE_ACTION_ROLE)
        notZeroValue(_balanceAdjustmentId)
        returns (bool success_)
    {
        (success_) = EquityStorageWrapper.cancelScheduledBalanceAdjustment(_balanceAdjustmentId);
        if (success_) {
            emit IAdjustBalances.ScheduledBalanceAdjustmentCancelled(_balanceAdjustmentId, EvmAccessors.getMsgSender());
        }
    }

    /// @inheritdoc IAdjustBalances
    function getScheduledBalanceAdjustment(
        uint256 _balanceAdjustmentID
    )
        external
        view
        override
        notZeroValue(_balanceAdjustmentID)
        onlyMatchingActionType(BALANCE_ADJUSTMENT_CORPORATE_ACTION_TYPE, _balanceAdjustmentID - 1)
        returns (IAdjustBalances.ScheduledBalanceAdjustment memory balanceAdjustment_, bool isDisabled_)
    {
        (balanceAdjustment_, , isDisabled_) = EquityStorageWrapper.getScheduledBalanceAdjustment(_balanceAdjustmentID);
    }

    /// @inheritdoc IAdjustBalances
    function getBalanceAdjustmentCount() external view override returns (uint256 balanceAdjustmentCount_) {
        return EquityStorageWrapper.getScheduledBalanceAdjustmentsCount();
    }

    /// @inheritdoc IAdjustBalances
    function getPendingBalanceAdjustmentCount() external view override returns (uint256) {
        return ScheduledTasksStorageWrapper.getScheduledBalanceAdjustmentCount();
    }

    /// @inheritdoc IAdjustBalances
    function getScheduledBalanceAdjustments(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (ScheduledTask[] memory scheduledBalanceAdjustment_) {
        scheduledBalanceAdjustment_ = ScheduledTasksStorageWrapper.getScheduledBalanceAdjustments(
            _pageIndex,
            _pageLength
        );
    }
}
