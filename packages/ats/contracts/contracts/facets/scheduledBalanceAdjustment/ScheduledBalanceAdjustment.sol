// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    IScheduledBalanceAdjustment,
    RESOLVER_KEY_SCHEDULED_BALANCE_ADJUSTMENT
} from "./IScheduledBalanceAdjustment.sol";
import { ROLE_CORPORATE_ACTION, ROLE_CORPORATE_ACTION_FORCE_CANCEL } from "../../constants/roles.sol";
import { CORPORATE_ACTION_TYPE_BALANCE_ADJUSTMENT } from "../../constants/dispatchTypes.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { EquityStorageWrapper } from "../../domain/asset/EquityStorageWrapper.sol";
import { ScheduledTasksStorageWrapper } from "../../domain/asset/ScheduledTasksStorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { ScheduledTask } from "../layer_2/scheduledTask/scheduledTasksCommon/IScheduledTasksCommon.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";

/**
 * @title ScheduledBalanceAdjustment
 * @author Asset Tokenization Studio Team
 * @notice Abstract implementation of `IScheduledBalanceAdjustment` providing scheduled
 *         balance adjustment corporate actions for tokenised assets.
 * @dev Inherits access-control guards from `Modifiers`. Scheduled adjustments are managed
 *      through `EquityStorageWrapper` and `ScheduledTasksStorageWrapper`. Intended to be
 *      inherited by `ScheduledBalanceAdjustmentFacet`.
 */
abstract contract ScheduledBalanceAdjustment is IScheduledBalanceAdjustment, Modifiers {
    /// @inheritdoc IScheduledBalanceAdjustment
    function initializeScheduledBalanceAdjustment()
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyFacetNotRegistered(RESOLVER_KEY_SCHEDULED_BALANCE_ADJUSTMENT)
    {
        InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_SCHEDULED_BALANCE_ADJUSTMENT);
        emit ScheduledBalanceAdjustmentInitialized();
    }

    /// @inheritdoc IScheduledBalanceAdjustment
    function setScheduledBalanceAdjustment(
        IScheduledBalanceAdjustment.ScheduledBalanceAdjustment calldata _newBalanceAdjustment
    )
        external
        override
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlyRole(ROLE_CORPORATE_ACTION)
        onlyValidTimestamp(_newBalanceAdjustment.executionDate)
        onlyValidFactor(_newBalanceAdjustment.factor)
        onlyNotOverflowingAdjustment(_newBalanceAdjustment.factor, _newBalanceAdjustment.decimals)
        returns (uint256 balanceAdjustmentID_)
    {
        bytes32 corporateActionID;
        (corporateActionID, balanceAdjustmentID_) = EquityStorageWrapper.setScheduledBalanceAdjustment(
            _newBalanceAdjustment
        );
        emit IScheduledBalanceAdjustment.ScheduledBalanceAdjustmentSet(
            corporateActionID,
            balanceAdjustmentID_,
            EvmAccessors.getMsgSender(),
            _newBalanceAdjustment.executionDate,
            _newBalanceAdjustment.factor,
            _newBalanceAdjustment.decimals
        );
    }

    /// @inheritdoc IScheduledBalanceAdjustment
    function cancelScheduledBalanceAdjustment(
        uint256 _balanceAdjustmentId
    )
        external
        override
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlyRole(ROLE_CORPORATE_ACTION)
        notZeroValue(_balanceAdjustmentId)
        returns (bool success_)
    {
        EquityStorageWrapper.cancelScheduledBalanceAdjustment(_balanceAdjustmentId);
        emit IScheduledBalanceAdjustment.ScheduledBalanceAdjustmentCancelled(
            _balanceAdjustmentId,
            EvmAccessors.getMsgSender()
        );
        success_ = true;
    }

    /// @inheritdoc IScheduledBalanceAdjustment
    /// @dev Restricted to `ROLE_CORPORATE_ACTION_FORCE_CANCEL`; gated by `onlyUnpaused` and
    ///      `onlyMatchingActionType(CORPORATE_ACTION_TYPE_BALANCE_ADJUSTMENT, _balanceAdjustmentId - 1)`.
    function forceCancelScheduledBalanceAdjustment(
        uint256 _balanceAdjustmentId
    )
        external
        override
        onlyActivated
        onlyUnpaused
        onlyRole(ROLE_CORPORATE_ACTION_FORCE_CANCEL)
        onlyMatchingActionType(CORPORATE_ACTION_TYPE_BALANCE_ADJUSTMENT, _balanceAdjustmentId - 1)
        returns (bool success_)
    {
        EquityStorageWrapper.forceCancelScheduledBalanceAdjustment(_balanceAdjustmentId);
        emit IScheduledBalanceAdjustment.ScheduledBalanceAdjustmentForceCancelled(
            _balanceAdjustmentId,
            EvmAccessors.getMsgSender()
        );
        success_ = true;
    }

    /// @inheritdoc IScheduledBalanceAdjustment
    function getScheduledBalanceAdjustment(
        uint256 _balanceAdjustmentID
    )
        external
        view
        override
        notZeroValue(_balanceAdjustmentID)
        onlyMatchingActionType(CORPORATE_ACTION_TYPE_BALANCE_ADJUSTMENT, _balanceAdjustmentID - 1)
        returns (IScheduledBalanceAdjustment.ScheduledBalanceAdjustment memory balanceAdjustment_, bool isDisabled_)
    {
        (balanceAdjustment_, , isDisabled_) = EquityStorageWrapper.getScheduledBalanceAdjustment(_balanceAdjustmentID);
    }

    /// @inheritdoc IScheduledBalanceAdjustment
    function getBalanceAdjustmentCount() external view override returns (uint256 balanceAdjustmentCount_) {
        return EquityStorageWrapper.getScheduledBalanceAdjustmentsCount();
    }

    /// @inheritdoc IScheduledBalanceAdjustment
    function getPendingBalanceAdjustmentCount(bool _includeDisabled) external view override returns (uint256) {
        return ScheduledTasksStorageWrapper.getScheduledBalanceAdjustmentCount(_includeDisabled);
    }

    /// @inheritdoc IScheduledBalanceAdjustment
    function getScheduledBalanceAdjustments(
        uint256 _pageIndex,
        uint256 _pageLength,
        bool _includeDisabled
    ) external view override returns (ScheduledTask[] memory scheduledBalanceAdjustment_) {
        scheduledBalanceAdjustment_ = ScheduledTasksStorageWrapper.getScheduledBalanceAdjustments(
            _pageIndex,
            _pageLength,
            _includeDisabled
        );
    }
}
