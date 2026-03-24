// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/* solhint-disable max-line-length */
import {
    TransferAndLockSustainabilityPerformanceTargetRateFacet
} from "../../../../facets/layer_3/transferAndLock/sustainabilityPerformanceTargetRate/TransferAndLockSustainabilityPerformanceTargetRateFacet.sol";
/* solhint-enable max-line-length */
import { TimeTravelProvider } from "../../timeTravel/TimeTravelProvider.sol";

contract TransferAndLockSustainabilityPerformanceTargetRateFacetTimeTravel is
    TransferAndLockSustainabilityPerformanceTargetRateFacet,
    TimeTravelProvider
{
    // Composed facet for testing
}
