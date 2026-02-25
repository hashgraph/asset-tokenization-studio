// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// solhint-disable max-line-length
import {
    BondUSASustainabilityPerformanceTargetRateFacet
} from "../../../facets/regulation/bondUSA/sustainabilityPerformanceTargetRate/BondUSASustainabilityPerformanceTargetRateFacet.sol";
// solhint-enable max-line-length
import { TimeTravelProvider } from "../TimeTravelProvider.sol";
import { TimestampProvider } from "../../../infrastructure/lib/TimestampProvider.sol";

contract BondUSASustainabilityPerformanceTargetRateFacetTimeTravel is
    BondUSASustainabilityPerformanceTargetRateFacet,
    TimeTravelProvider
{
    function _getBlockTimestamp() internal view override(TimestampProvider, TimeTravelProvider) returns (uint256) {
        return TimeTravelProvider._getBlockTimestamp();
    }

    function _getBlockNumber() internal view override(TimestampProvider, TimeTravelProvider) returns (uint256) {
        return TimeTravelProvider._getBlockNumber();
    }
}
