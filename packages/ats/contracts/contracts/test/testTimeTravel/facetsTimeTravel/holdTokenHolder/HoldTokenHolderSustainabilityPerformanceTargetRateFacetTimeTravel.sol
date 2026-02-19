// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// solhint-disable max-line-length
import {
    HoldTokenHolderSustainabilityPerformanceTargetRateFacet
} from "../../../../facets/features/hold/sustainabilityPerformanceTargetRate/HoldTokenHolderSustainabilityPerformanceTargetRateFacet.sol";
// solhint-enable max-line-length
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

contract HoldTokenHolderSustainabilityPerformanceTargetRateFacetTimeTravel is
    HoldTokenHolderSustainabilityPerformanceTargetRateFacet,
    TimeTravelStorageWrapper
{
    function _getBlockTimestamp() internal view override returns (uint256) {
        return TimeTravelStorageWrapper._blockTimestamp();
    }
}
