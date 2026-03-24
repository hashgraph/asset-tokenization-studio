// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// solhint-disable max-line-length

import {
    ScheduledCrossOrderedTasksSustainabilityPerformanceTargetRateFacet
} from "../../../../facets/layer_2/scheduledTask/scheduledCrossOrderedTask/ScheduledCrossOrderedTasksSustainabilityPerformanceTargetRateFacet.sol";
import { TimeTravelProvider } from "../../timeTravel/TimeTravelProvider.sol";

contract ScheduledCrossOrderedTasksSustainabilityPerformanceTargetRateFacetTimeTravel is
    ScheduledCrossOrderedTasksSustainabilityPerformanceTargetRateFacet,
    TimeTravelProvider
{}
