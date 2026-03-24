// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    KpisSustainabilityPerformanceTargetRateFacet
} from "../../../../facets/layer_2/kpi/kpiLatest/KpisSustainabilityPerformanceTargetRateFacet.sol";
import { TimeTravelProvider } from "../../timeTravel/TimeTravelProvider.sol";

contract KpisSustainabilityPerformanceTargetRateFacetTimeTravel is
    KpisSustainabilityPerformanceTargetRateFacet,
    TimeTravelProvider
{}
