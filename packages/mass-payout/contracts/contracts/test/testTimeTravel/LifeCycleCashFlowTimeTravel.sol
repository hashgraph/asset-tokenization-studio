// SPDX-License-Identifier: Apache-2.0

pragma solidity 0.8.22;

import { LifeCycleCashFlow } from "../../LifeCycleCashFlow.sol";
import { LocalContext } from "../../common/LocalContext.sol";
import { TimeTravel } from "./timeTravel/TimeTravel.sol";

contract LifeCycleCashFlowTimeTravel is LifeCycleCashFlow, TimeTravel {
    function _blockTimestamp() internal view override(LocalContext, TimeTravel) returns (uint256) {
        return TimeTravel._blockTimestamp();
    }
}
