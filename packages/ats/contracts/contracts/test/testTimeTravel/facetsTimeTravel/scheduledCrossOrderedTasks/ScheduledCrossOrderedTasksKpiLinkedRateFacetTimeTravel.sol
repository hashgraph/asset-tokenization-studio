// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    ScheduledCrossOrderedTasksKpiLinkedRateFacet
} from "../../../../facets/layer_2/scheduledTask/scheduledCrossOrderedTask/ScheduledCrossOrderedTasksKpiLinkedRateFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

contract ScheduledCrossOrderedTasksKpiLinkedRateFacetTimeTravel is
    ScheduledCrossOrderedTasksKpiLinkedRateFacet,
    TimeTravelStorageWrapper
{}
