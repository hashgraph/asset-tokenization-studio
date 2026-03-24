// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    ScheduledBalanceAdjustmentsFacet
} from "../../../../facets/layer_2/scheduledTask/scheduledBalanceAdjustment/ScheduledBalanceAdjustmentsFacet.sol";
import { TimeTravelProvider } from "../../timeTravel/TimeTravelProvider.sol";

contract ScheduledBalanceAdjustmentsFacetTimeTravel is ScheduledBalanceAdjustmentsFacet, TimeTravelProvider {
    // solhint-disable-next-line no-empty-blocks
}
