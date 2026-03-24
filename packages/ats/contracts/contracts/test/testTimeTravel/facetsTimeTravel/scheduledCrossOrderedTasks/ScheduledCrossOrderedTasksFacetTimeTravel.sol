// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    ScheduledCrossOrderedTasksFacet
} from "../../../../facets/layer_2/scheduledTask/scheduledCrossOrderedTask/ScheduledCrossOrderedTasksFacet.sol";
import { TimeTravelProvider } from "../../timeTravel/TimeTravelProvider.sol";

contract ScheduledCrossOrderedTasksFacetTimeTravel is ScheduledCrossOrderedTasksFacet, TimeTravelProvider {
    // solhint-disable-next-line no-empty-blocks
}
