// SPDX-License-Identifier: Apache-2.0
// Contract copy-pasted form OZ and extended

pragma solidity >=0.8.0 <0.9.0;

// solhint-disable max-line-length
import {
    ERC20VotesSustainabilityPerformanceTargetRateFacet
} from "../../../../facets/features/ERC1400/ERC20Votes/sustainabilityPerformanceTargetRate/ERC20VotesSustainabilityPerformanceTargetRateFacet.sol";
// solhint-enable max-line-length
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

// solhint-disable-next-line no-empty-blocks
contract ERC20VotesSustainabilityPerformanceTargetRateFacetTimeTravel is
    ERC20VotesSustainabilityPerformanceTargetRateFacet,
    TimeTravelStorageWrapper
{
    function _getBlockTimestamp() internal view override returns (uint256) {
        return TimeTravelStorageWrapper._blockTimestamp();
    }
}
