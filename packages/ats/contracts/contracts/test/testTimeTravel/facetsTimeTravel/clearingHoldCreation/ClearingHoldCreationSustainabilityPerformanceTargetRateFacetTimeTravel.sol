// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    ClearingHoldCreationSustainabilityPerformanceTargetRateFacet
} from "../../../../layer_1/clearing/sustainabilityPerformanceTargetRate/ClearingHoldCreationSustainabilityPerformanceTargetRateFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";
import { LocalContext } from "../../../../layer_0/context/LocalContext.sol";

contract ClearingHoldCreationSustainabilityPerformanceTargetRateFacetTimeTravel is
    ClearingHoldCreationSustainabilityPerformanceTargetRateFacet,
    TimeTravelStorageWrapper
{
    function _blockTimestamp() internal view override(LocalContext, TimeTravelStorageWrapper) returns (uint256) {
        return TimeTravelStorageWrapper._blockTimestamp();
    }

    function _blockNumber() internal view override(LocalContext, TimeTravelStorageWrapper) returns (uint256) {
        return TimeTravelStorageWrapper._blockNumber();
    }
}
