// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// solhint-disable max-line-length
import {
    KpisSustainabilityPerformanceTargetRateFacet
} from "../../../../facets/assetCapabilities/kpis/kpiLatest/sustainabilityPerformanceTargetRate/KpisSustainabilityPerformanceTargetRateFacet.sol"; // solhint-disable-line max-line-length
// solhint-enable max-line-length
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

contract KpisSustainabilityPerformanceTargetRateFacetTimeTravel is
    KpisSustainabilityPerformanceTargetRateFacet,
    TimeTravelStorageWrapper
{
    function _getBlockTimestamp() internal view override returns (uint256) {
        return TimeTravelStorageWrapper._blockTimestamp();
    }
}
