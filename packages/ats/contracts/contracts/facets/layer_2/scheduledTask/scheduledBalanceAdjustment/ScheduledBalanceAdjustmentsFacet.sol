// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IScheduledBalanceAdjustments } from "./IScheduledBalanceAdjustments.sol";
import { ScheduledBalanceAdjustments } from "./ScheduledBalanceAdjustments.sol";
import { IStaticFunctionSelectors } from "../../../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _SCHEDULED_BALANCE_ADJUSTMENTS_RESOLVER_KEY } from "../../../../constants/resolverKeys.sol";

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
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IScheduledBalanceAdjustments).interfaceId;
    }
}
