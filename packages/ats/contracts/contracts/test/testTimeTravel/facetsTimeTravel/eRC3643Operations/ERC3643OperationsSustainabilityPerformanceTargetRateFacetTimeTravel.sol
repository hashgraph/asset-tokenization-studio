// SPDX-License-Identifier: Apache-2.0
// Contract copy-pasted form OZ and extended

pragma solidity >=0.8.0 <0.9.0;

// solhint-disable max-line-length
import {
    ERC3643OperationsSustainabilityPerformanceTargetRateFacet
} from "../../../../facets/features/ERC3643/sustainabilityPerformanceTargetRate/ERC3643OperationsSustainabilityPerformanceTargetRateFacet.sol";
// solhint-enable max-line-length
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

contract ERC3643OperationsSustainabilityPerformanceTargetRateFacetTimeTravel is
    ERC3643OperationsSustainabilityPerformanceTargetRateFacet,
    TimeTravelStorageWrapper
{
    function _getBlockTimestamp() internal view override returns (uint256) {
        return TimeTravelStorageWrapper._blockTimestamp();
    }
}
