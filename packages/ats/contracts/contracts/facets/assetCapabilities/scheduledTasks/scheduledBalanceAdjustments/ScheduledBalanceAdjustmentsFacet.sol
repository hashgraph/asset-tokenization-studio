// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ScheduledBalanceAdjustments } from "./ScheduledBalanceAdjustments.sol";
import {
    IScheduledBalanceAdjustments
} from "../../interfaces/scheduledTasks/scheduledBalanceAdjustments/IScheduledBalanceAdjustments.sol";
import { IStaticFunctionSelectors } from "../../../../infrastructure/interfaces/IStaticFunctionSelectors.sol";
import { _SCHEDULED_BALANCE_ADJUSTMENTS_RESOLVER_KEY } from "../../../../constants/resolverKeys/assets.sol";

contract ScheduledBalanceAdjustmentsFacet is ScheduledBalanceAdjustments, IStaticFunctionSelectors {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _SCHEDULED_BALANCE_ADJUSTMENTS_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](2);
        staticFunctionSelectors_[selectorIndex++] = this.scheduledBalanceAdjustmentCount.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getScheduledBalanceAdjustments.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        staticInterfaceIds_[0] = type(IScheduledBalanceAdjustments).interfaceId;
    }
}
