// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/* solhint-disable max-line-length */
import {
    TransferAndLockSustainabilityPerformanceTargetRateFacet
} from "../../../../facets/layer_3/transferAndLock/sustainabilityPerformanceTargetRate/TransferAndLockSustainabilityPerformanceTargetRateFacet.sol";
/* solhint-enable max-line-length */
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

contract TransferAndLockSustainabilityPerformanceTargetRateFacetTimeTravel is
    TransferAndLockSustainabilityPerformanceTargetRateFacet,
    TimeTravelStorageWrapper
{
    // Composed facet for testing
}
