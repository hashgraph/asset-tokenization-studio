// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// solhint-disable max-line-length

import {
    SustainabilityPerformanceTargetRateFacet
} from "../../../../facets/layer_2/interestRate/sustainabilityPerformanceTargetRate/SustainabilityPerformanceTargetRateFacet.sol";
import { TimeTravelProvider } from "../../timeTravel/TimeTravelProvider.sol";

contract SustainabilityPerformanceTargetRateFacetTimeTravel is
    SustainabilityPerformanceTargetRateFacet,
    TimeTravelProvider
{}
