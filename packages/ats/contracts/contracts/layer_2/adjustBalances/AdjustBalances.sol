// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;
import { IAdjustBalances } from "../interfaces/adjustBalances/IAdjustBalances.sol";
import { Internals } from "../../layer_0/Internals.sol";
import { _ADJUSTMENT_BALANCE_ROLE } from "../constants/roles.sol";

abstract contract AdjustBalances is IAdjustBalances, Internals {
    function adjustBalances(
        uint256 factor,
        uint8 decimals
    ) external override onlyUnpaused onlyRole(_ADJUSTMENT_BALANCE_ROLE) validateFactor(factor) returns (bool success_) {
        _callTriggerPendingScheduledCrossOrderedTasks();
        _adjustBalances(factor, decimals);
        success_ = true;
    }
}
