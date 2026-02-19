// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _SCHEDULED_TASKS_RESOLVER_KEY } from "../../../../../constants/resolverKeys/assets.sol";
import { ScheduledCrossOrderedTasksFacetBase } from "../ScheduledCrossOrderedTasksFacetBase.sol";

contract ScheduledCrossOrderedTasksFacet is ScheduledCrossOrderedTasksFacetBase {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _SCHEDULED_TASKS_RESOLVER_KEY;
    }
}
