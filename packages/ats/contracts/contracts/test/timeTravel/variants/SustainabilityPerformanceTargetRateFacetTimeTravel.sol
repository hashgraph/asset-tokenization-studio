// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// solhint-disable max-line-length
import {
    SustainabilityPerformanceTargetRateFacet
} from "../../../facets/assetCapabilities/interestRates/sustainabilityPerformanceTargetRate/SustainabilityPerformanceTargetRateFacet.sol";
// solhint-enable max-line-length
import { TimeTravelProvider } from "../TimeTravelProvider.sol";
import { TimestampProvider } from "../../../infrastructure/lib/TimestampProvider.sol";

contract SustainabilityPerformanceTargetRateFacetTimeTravel is
    SustainabilityPerformanceTargetRateFacet,
    TimeTravelProvider
{
    function _getBlockTimestamp() internal view override(TimestampProvider, TimeTravelProvider) returns (uint256) {
        return TimeTravelProvider._getBlockTimestamp();
    }

    function _getBlockNumber() internal view override(TimestampProvider, TimeTravelProvider) returns (uint256) {
        return TimeTravelProvider._getBlockNumber();
    }
}
