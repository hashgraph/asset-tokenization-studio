// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// solhint-disable max-line-length
import {
    ClearingRedeemSustainabilityPerformanceTargetRateFacet
} from "../../../../facets/features/clearing/sustainabilityPerformanceTargetRate/ClearingRedeemSustainabilityPerformanceTargetRateFacet.sol";
// solhint-enable max-line-length
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

contract ClearingRedeemSustainabilityPerformanceTargetRateFacetTimeTravel is
    ClearingRedeemSustainabilityPerformanceTargetRateFacet,
    TimeTravelStorageWrapper
{
    function _getBlockTimestamp() internal view override returns (uint256) {
        return TimeTravelStorageWrapper._blockTimestamp();
    }
}
