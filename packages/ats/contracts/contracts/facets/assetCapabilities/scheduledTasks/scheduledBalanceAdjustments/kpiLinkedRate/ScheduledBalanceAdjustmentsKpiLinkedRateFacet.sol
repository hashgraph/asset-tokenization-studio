// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// solhint-disable-next-line max-line-length
import {
    _SCHEDULED_BALANCE_ADJUSTMENTS_KPI_LINKED_RATE_RESOLVER_KEY
} from "../../../../../constants/resolverKeys/assets.sol";
import { ScheduledBalanceAdjustmentsFacetBase } from "../ScheduledBalanceAdjustmentsFacetBase.sol";

contract ScheduledBalanceAdjustmentsKpiLinkedRateFacet is ScheduledBalanceAdjustmentsFacetBase {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _SCHEDULED_BALANCE_ADJUSTMENTS_KPI_LINKED_RATE_RESOLVER_KEY;
    }
}
