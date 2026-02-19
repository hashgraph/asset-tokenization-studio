// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// solhint-disable max-line-length
import {
    BondUSAReadSustainabilityPerformanceTargetRateFacet
} from "../../../../facets/regulation/bondUSA/sustainabilityPerformanceTargetRate/BondUSAReadSustainabilityPerformanceTargetRateFacet.sol";
// solhint-enable max-line-length
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

contract BondUSAReadSustainabilityPerformanceTargetRateFacetTimeTravel is
    BondUSAReadSustainabilityPerformanceTargetRateFacet,
    TimeTravelStorageWrapper
{
    function _getBlockTimestamp() internal view override returns (uint256) {
        return _timestamp == 0 ? block.timestamp : _timestamp;
    }
}
