// SPDX-License-Identifier: Apache-2.0
// Contract copy-pasted form OZ and extended

pragma solidity >=0.8.0 <0.9.0;

// solhint-disable max-line-length
import {
    ERC1410ManagementSustainabilityPerformanceTargetRateFacet
} from "../../../../facets/features/ERC1400/ERC1410/sustainabilityPerformanceTargetRate/ERC1410ManagementSustainabilityPerformanceTargetRateFacet.sol";
// solhint-enable max-line-length
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

// solhint-disable-next-line no-empty-blocks
contract ERC1410ManagementSustainabilityPerformanceTargetRateFacetTimeTravel is
    ERC1410ManagementSustainabilityPerformanceTargetRateFacet,
    TimeTravelStorageWrapper
{
    function _getBlockTimestamp() internal view override returns (uint256) {
        return TimeTravelStorageWrapper._blockTimestamp();
    }
}
