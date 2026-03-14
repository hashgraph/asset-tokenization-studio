// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    ScheduledBalanceAdjustmentsFacet
} from "../../../../facets/layer_2/scheduledTask/scheduledBalanceAdjustment/ScheduledBalanceAdjustmentsFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

contract ScheduledBalanceAdjustmentsFacetTimeTravel is ScheduledBalanceAdjustmentsFacet, TimeTravelStorageWrapper {
    // solhint-disable-previous-line no-empty-blocks
}
