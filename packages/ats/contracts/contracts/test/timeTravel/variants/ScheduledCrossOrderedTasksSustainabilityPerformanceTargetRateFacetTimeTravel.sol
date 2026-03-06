// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// solhint-disable max-line-length
import {
    ScheduledCrossOrderedTasksSustainabilityPerformanceTargetRateFacet
} from "../../../facets/asset/scheduledTask/scheduledCrossOrderedTask/sustainabilityPerformanceTargetRate/ScheduledCrossOrderedTasksSustainabilityPerformanceTargetRateFacet.sol";
// solhint-enable max-line-length
import { TimeTravelProvider } from "../TimeTravelProvider.sol";
import { TimestampProvider } from "../../../infrastructure/utils/TimestampProvider.sol";

contract ScheduledCrossOrderedTasksSustainabilityPerformanceTargetRateFacetTimeTravel is
    ScheduledCrossOrderedTasksSustainabilityPerformanceTargetRateFacet,
    TimeTravelProvider
{
    function _getBlockTimestamp() internal view override(TimestampProvider, TimeTravelProvider) returns (uint256) {
        return TimeTravelProvider._getBlockTimestamp();
    }

    function _getBlockNumber() internal view override(TimestampProvider, TimeTravelProvider) returns (uint256) {
        return TimeTravelProvider._getBlockNumber();
    }
}
