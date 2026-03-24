// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IAdjustBalances } from "./IAdjustBalances.sol";
import { _ADJUSTMENT_BALANCE_ROLE } from "../../../constants/roles.sol";
import { AccessControlStorageWrapper } from "../../../domain/core/AccessControlStorageWrapper.sol";
import { AccessControlModifiers } from "../../../infrastructure/utils/AccessControlModifiers.sol";
import { PauseModifiers } from "../../../domain/core/PauseModifiers.sol";
import { AdjustBalancesStorageWrapper } from "../../../domain/asset/AdjustBalancesStorageWrapper.sol";
import { ScheduledTasksStorageWrapper } from "../../../domain/asset/ScheduledTasksStorageWrapper.sol";

abstract contract AdjustBalances is IAdjustBalances, AccessControlModifiers, PauseModifiers {
    function adjustBalances(
        uint256 factor,
        uint8 decimals
    ) external override onlyUnpaused onlyRole(_ADJUSTMENT_BALANCE_ROLE) returns (bool success_) {
        AdjustBalancesStorageWrapper.requireValidFactor(factor);
        ScheduledTasksStorageWrapper.triggerScheduledCrossOrderedTasks(0);
        AdjustBalancesStorageWrapper.adjustBalances(factor, decimals);
        success_ = true;
    }
}
