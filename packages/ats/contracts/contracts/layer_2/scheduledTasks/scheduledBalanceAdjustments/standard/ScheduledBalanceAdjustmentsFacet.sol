// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _SCHEDULED_BALANCE_ADJUSTMENTS_RESOLVER_KEY } from "../../../constants/resolverKeys.sol";
import { ScheduledBalanceAdjustmentsFacetBase } from "../ScheduledBalanceAdjustmentsFacetBase.sol";
import { Common } from "../../../../layer_0/common/Common.sol";

contract ScheduledBalanceAdjustmentsFacet is ScheduledBalanceAdjustmentsFacetBase, Common {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _SCHEDULED_BALANCE_ADJUSTMENTS_RESOLVER_KEY;
    }
}
