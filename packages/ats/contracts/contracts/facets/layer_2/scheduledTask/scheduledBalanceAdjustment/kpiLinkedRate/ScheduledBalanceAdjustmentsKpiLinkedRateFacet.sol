// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _SCHEDULED_BALANCE_ADJUSTMENTS_KPI_LINKED_RATE_RESOLVER_KEY } from "../../../../../constants/resolverKeys.sol";
import { ScheduledBalanceAdjustmentsFacetBase } from "../ScheduledBalanceAdjustmentsFacetBase.sol";
/* solhint-disable max-line-length */
import {
    CommonKpiLinkedInterestRate
} from "../../../../../domain/asset/extension/bond/fixingDateInterestRate/kpiInterestRate/kpiLinkedInterestRate/Common.sol";
/* solhint-enable max-line-length */

contract ScheduledBalanceAdjustmentsKpiLinkedRateFacet is
    ScheduledBalanceAdjustmentsFacetBase,
    CommonKpiLinkedInterestRate
{
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _SCHEDULED_BALANCE_ADJUSTMENTS_KPI_LINKED_RATE_RESOLVER_KEY;
    }
}
