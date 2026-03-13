// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    SustainabilityPerformanceTargetRateFacet
} from "../../../../facets/layer_2/interestRate/sustainabilityPerformanceTargetRate/SustainabilityPerformanceTargetRateFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

contract SustainabilityPerformanceTargetRateFacetTimeTravel is
    SustainabilityPerformanceTargetRateFacet,
    TimeTravelStorageWrapper
{}
