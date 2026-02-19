// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// solhint-disable max-line-length
import {
    ERC1643SustainabilityPerformanceTargetRateFacet
} from "../../../../facets/features/ERC1400/ERC1643/sustainabilityPerformanceTargetRate/ERC1643SustainabilityPerformanceTargetRateFacet.sol";
// solhint-enable max-line-length
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

// solhint-disable-next-line no-empty-blocks
contract ERC1643SustainabilityPerformanceTargetRateFacetTimeTravel is
    ERC1643SustainabilityPerformanceTargetRateFacet,
    TimeTravelStorageWrapper
{}
