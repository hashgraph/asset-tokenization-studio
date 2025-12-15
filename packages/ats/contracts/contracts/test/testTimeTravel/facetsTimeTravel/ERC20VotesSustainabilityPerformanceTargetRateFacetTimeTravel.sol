// SPDX-License-Identifier: Apache-2.0
// Contract copy-pasted form OZ and extended

pragma solidity >=0.8.0 <0.9.0;

import { ERC20VotesSustainabilityPerformanceTargetRateFacet } from "../../../layer_1/ERC1400/ERC20Votes/sustainabilityPerformanceTargetRate/ERC20VotesSustainabilityPerformanceTargetRateFacet.sol";
import { TimeTravelStorageWrapper } from "../timeTravel/TimeTravelStorageWrapper.sol";
import { LocalContext } from "../../../layer_0/context/LocalContext.sol";

contract ERC20VotesSustainabilityPerformanceTargetRateFacetTimeTravel is ERC20VotesSustainabilityPerformanceTargetRateFacet, TimeTravelStorageWrapper {
    function _blockTimestamp() internal view override(LocalContext, TimeTravelStorageWrapper) returns (uint256) {
        return TimeTravelStorageWrapper._blockTimestamp();
    }

    function _blockNumber() internal view override(LocalContext, TimeTravelStorageWrapper) returns (uint256) {
        return TimeTravelStorageWrapper._blockNumber();
    }
}
