// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// solhint-disable max-line-length
import {
    ERC3643ReadSustainabilityPerformanceTargetRateFacet
} from "../../../../facets/features/ERC3643/sustainabilityPerformanceTargetRate/ERC3643ReadSustainabilityPerformanceTargetRateFacet.sol";
// solhint-enable max-line-length
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

// solhint-disable-next-line no-empty-blocks
contract ERC3643ReadSustainabilityPerformanceTargetRateFacetTimeTravel is
    ERC3643ReadSustainabilityPerformanceTargetRateFacet,
    TimeTravelStorageWrapper
{}
