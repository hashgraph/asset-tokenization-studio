// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    _SCHEDULED_BALANCE_ADJUSTMENTS_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY
} from "../../../constants/resolverKeys.sol";
import { ScheduledBalanceAdjustmentsFacetBase } from "../ScheduledBalanceAdjustmentsFacetBase.sol";
import {
    CommonSustainabilityPerformanceTargetInterestRate
} from "../../../../layer_0_extensions/bond/fixingDateInterestRate/kpiInterestRate/sustainabilityPerformanceTargetInterestRate/Common.sol";

contract ScheduledBalanceAdjustmentsSustainabilityPerformanceTargetRateFacet is
    ScheduledBalanceAdjustmentsFacetBase,
    CommonSustainabilityPerformanceTargetInterestRate
{
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _SCHEDULED_BALANCE_ADJUSTMENTS_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY;
    }
}
