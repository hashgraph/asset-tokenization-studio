// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    ScheduledCrossOrderedTasksSustainabilityPerformanceTargetRateFacet
} from "../../../../facets/layer_2/scheduledTask/scheduledCrossOrderedTask/ScheduledCrossOrderedTasksSustainabilityPerformanceTargetRateFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

contract ScheduledCrossOrderedTasksSustainabilityPerformanceTargetRateFacetTimeTravel is
    ScheduledCrossOrderedTasksSustainabilityPerformanceTargetRateFacet,
    TimeTravelStorageWrapper
{}
