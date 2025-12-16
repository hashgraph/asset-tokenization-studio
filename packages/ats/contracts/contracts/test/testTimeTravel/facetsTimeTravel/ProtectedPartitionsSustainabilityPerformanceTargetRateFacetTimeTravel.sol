// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    ProtectedPartitionsSustainabilityPerformanceTargetRateFacet
} from "contracts/layer_1/protectedPartitions/sustainabilityPerformanceTargetRate/ProtectedPartitionsSustainabilityPerformanceTargetRateFacet.sol";
import { TimeTravelStorageWrapper } from "../timeTravel/TimeTravelStorageWrapper.sol";
import { LocalContext } from "contracts/layer_0/context/LocalContext.sol";

contract ProtectedPartitionsSustainabilityPerformanceTargetRateFacetTimeTravel is
    ProtectedPartitionsSustainabilityPerformanceTargetRateFacet,
    TimeTravelStorageWrapper
{
    function _blockTimestamp() internal view override(LocalContext, TimeTravelStorageWrapper) returns (uint256) {
        return TimeTravelStorageWrapper._blockTimestamp();
    }

    function _blockNumber() internal view override(LocalContext, TimeTravelStorageWrapper) returns (uint256) {
        return TimeTravelStorageWrapper._blockNumber();
    }
}
