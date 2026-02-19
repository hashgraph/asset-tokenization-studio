// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// solhint-disable max-line-length
import {
    ERC3643ManagementSustainabilityPerformanceTargetRateFacet
} from "../../../../facets/features/ERC3643/sustainabilityPerformanceTargetRate/ERC3643ManagementSustainabilityPerformanceTargetRateFacet.sol";
// solhint-enable max-line-length
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

contract ERC3643ManagementSustainabilityPerformanceTargetRateFacetTimeTravel is
    ERC3643ManagementSustainabilityPerformanceTargetRateFacet,
    TimeTravelStorageWrapper
{
    function _getBlockTimestamp() internal view override returns (uint256) {
        return TimeTravelStorageWrapper._blockTimestamp();
    }
}
