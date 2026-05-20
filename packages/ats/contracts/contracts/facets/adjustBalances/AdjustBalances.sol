// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IAdjustBalances } from "./IAdjustBalances.sol";
import { ADJUSTMENT_BALANCE_ROLE } from "../../constants/roles.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { AdjustBalancesStorageWrapper } from "../../domain/asset/AdjustBalancesStorageWrapper.sol";
import { ScheduledTasksStorageWrapper } from "../../domain/asset/ScheduledTasksStorageWrapper.sol";
import { TokenCoreOps } from "../../domain/orchestrator/TokenCoreOps.sol";

/**
 * @title AdjustBalances
 * @author Asset Tokenization Studio Team
 * @notice Abstract implementation of `IAdjustBalances` providing immediate
 *         balance adjustment corporate actions for tokenised assets.
 * @dev Inherits access-control guards from `Modifiers`. Immediate adjustments are applied via
 *      `AdjustBalancesStorageWrapper`. Scheduled adjustments are handled by `IScheduledBalanceAdjustment`.
 *      Intended to be inherited by `AdjustBalancesFacet`.
 */
abstract contract AdjustBalances is IAdjustBalances, Modifiers {
    /// @inheritdoc IAdjustBalances
    /// @dev Emits {AdjustmentBalanceSet}.
    function adjustBalances(
        uint256 factor,
        uint8 decimals
    )
        external
        override
        onlyActivated
        onlyUnpaused
        onlyRole(ADJUSTMENT_BALANCE_ROLE)
        onlyValidFactor(factor)
        onlyNotOverflowingAdjustment(factor, decimals)
        returns (bool success_)
    {
        ScheduledTasksStorageWrapper.triggerScheduledCrossOrderedTasks(0);
        AdjustBalancesStorageWrapper.adjustBalances(factor, decimals);
        success_ = true;
    }

    /// @inheritdoc IAdjustBalances
    /// @dev May emit {SnapshotTriggered} or {AdjustmentBalanceSet} depending on pending scheduled tasks.
    function triggerAndSyncAll(
        bytes32 _partition,
        address _from,
        address _to
    ) external override onlyActivated onlyUnpaused {
        TokenCoreOps.triggerAndSyncAll(_partition, _from, _to);
    }
}
