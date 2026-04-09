// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IAdjustBalances } from "./IAdjustBalances.sol";
import { _ADJUSTMENT_BALANCE_ROLE } from "../../../constants/roles.sol";
import { Modifiers } from "../../../services/Modifiers.sol";
import { AdjustBalancesStorageWrapper } from "../../../domain/asset/AdjustBalancesStorageWrapper.sol";
import { ScheduledTasksStorageWrapper } from "../../../domain/asset/ScheduledTasksStorageWrapper.sol";

abstract contract AdjustBalances is IAdjustBalances, Modifiers {
    function adjustBalances(
        uint256 factor,
        uint8 decimals
    )
        external
        override
        onlyUnpaused
        onlyRole(_ADJUSTMENT_BALANCE_ROLE)
        onlyValidFactor(factor)
        returns (bool success_)
    {
        ScheduledTasksStorageWrapper.triggerScheduledCrossOrderedTasks(0);
        AdjustBalancesStorageWrapper.adjustBalances(factor, decimals);
        success_ = true;
    }
}
