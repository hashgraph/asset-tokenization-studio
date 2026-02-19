// SPDX-License-Identifier: Apache-2.0
// Contract copy-pasted form OZ and extended

pragma solidity >=0.8.0 <0.9.0;

// solhint-disable max-line-length
import {
    ERC20SustainabilityPerformanceTargetRateFacet
} from "../../../../facets/features/ERC1400/ERC20/sustainabilityPerformanceTargetRate/ERC20SustainabilityPerformanceTargetRateFacet.sol";
// solhint-enable max-line-length
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

contract ERC20SustainabilityPerformanceTargetRateFacetTimeTravel is
    ERC20SustainabilityPerformanceTargetRateFacet,
    TimeTravelStorageWrapper
{
    function _getBlockTimestamp() internal view override returns (uint256) {
        return TimeTravelStorageWrapper._blockTimestamp();
    }
}
