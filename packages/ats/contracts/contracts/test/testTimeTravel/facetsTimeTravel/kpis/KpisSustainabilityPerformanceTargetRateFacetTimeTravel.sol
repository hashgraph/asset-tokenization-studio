// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    KpisSustainabilityPerformanceTargetRateFacet
} from "../../../../facets/layer_2/kpi/kpiLatest/KpisSustainabilityPerformanceTargetRateFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

contract KpisSustainabilityPerformanceTargetRateFacetTimeTravel is
    KpisSustainabilityPerformanceTargetRateFacet,
    TimeTravelStorageWrapper
{}
