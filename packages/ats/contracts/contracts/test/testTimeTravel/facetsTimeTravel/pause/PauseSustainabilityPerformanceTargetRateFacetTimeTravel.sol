// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// solhint-disable max-line-length
import {
    PauseSustainabilityPerformanceTargetRateFacet
} from "../../../../facets/features/pause/sustainabilityPerformanceTargetRate/PauseSustainabilityPerformanceTargetRateFacet.sol";
// solhint-enable max-line-length
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

// solhint-disable no-empty-blocks
contract PauseSustainabilityPerformanceTargetRateFacetTimeTravel is
    PauseSustainabilityPerformanceTargetRateFacet,
    TimeTravelStorageWrapper
{}
// solhint-enable no-empty-blocks
