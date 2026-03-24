// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// solhint-disable max-line-length

import {
    ScheduledCrossOrderedTasksKpiLinkedRateFacet
} from "../../../../facets/layer_2/scheduledTask/scheduledCrossOrderedTask/ScheduledCrossOrderedTasksKpiLinkedRateFacet.sol";
import { TimeTravelProvider } from "../../timeTravel/TimeTravelProvider.sol";

contract ScheduledCrossOrderedTasksKpiLinkedRateFacetTimeTravel is
    ScheduledCrossOrderedTasksKpiLinkedRateFacet,
    TimeTravelProvider
{}
