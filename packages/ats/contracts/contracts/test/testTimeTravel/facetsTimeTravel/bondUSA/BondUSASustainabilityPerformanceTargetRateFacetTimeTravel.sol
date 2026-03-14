// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/* solhint-disable max-line-length */
import {
    BondUSASustainabilityPerformanceTargetRateFacet
} from "../../../../facets/layer_3/bondUSA/sustainabilityPerformanceTargetRate/BondUSASustainabilityPerformanceTargetRateFacet.sol";
/* solhint-enable max-line-length */
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

contract BondUSASustainabilityPerformanceTargetRateFacetTimeTravel is
    BondUSASustainabilityPerformanceTargetRateFacet,
    TimeTravelStorageWrapper
{
    // Composed facet for testing
}
