// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// solhint-disable max-line-length
import {
    ERC1644SustainabilityPerformanceTargetRateFacet
} from "../../../../facets/features/ERC1400/ERC1644/sustainabilityPerformanceTargetRate/ERC1644SustainabilityPerformanceTargetRateFacet.sol";
// solhint-enable max-line-length
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

contract ERC1644SustainabilityPerformanceTargetRateFacetTimeTravel is
    ERC1644SustainabilityPerformanceTargetRateFacet,
    TimeTravelStorageWrapper
{
    function _getBlockTimestamp() internal view override returns (uint256) {
        return TimeTravelStorageWrapper._blockTimestamp();
    }
}
