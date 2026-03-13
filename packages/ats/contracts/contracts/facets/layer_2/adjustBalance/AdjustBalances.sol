// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IAdjustBalances } from "./IAdjustBalances.sol";
import { _ADJUSTMENT_BALANCE_ROLE } from "../../../constants/roles.sol";
import { AccessControlStorageWrapper } from "../../../domain/core/AccessControlStorageWrapper.sol";
import { PauseStorageWrapper } from "../../../domain/core/PauseStorageWrapper.sol";
import { AdjustBalancesStorageWrapper } from "../../../domain/asset/AdjustBalancesStorageWrapper.sol";
import { ScheduledTasksStorageWrapper } from "../../../domain/asset/ScheduledTasksStorageWrapper.sol";

abstract contract AdjustBalances is IAdjustBalances {
    function adjustBalances(uint256 factor, uint8 decimals) external override returns (bool success_) {
        PauseStorageWrapper._requireNotPaused();
        AccessControlStorageWrapper._checkRole(_ADJUSTMENT_BALANCE_ROLE, msg.sender);
        AdjustBalancesStorageWrapper._requireValidFactor(factor);
        ScheduledTasksStorageWrapper._callTriggerPendingScheduledCrossOrderedTasks();
        AdjustBalancesStorageWrapper._adjustBalances(factor, decimals);
        success_ = true;
    }
}
