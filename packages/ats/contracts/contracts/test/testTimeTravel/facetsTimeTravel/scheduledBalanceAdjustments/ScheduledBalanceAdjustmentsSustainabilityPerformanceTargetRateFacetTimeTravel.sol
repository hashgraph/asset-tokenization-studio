// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// solhint-disable max-line-length
import {
    ScheduledBalanceAdjustmentsSustainabilityPerformanceTargetRateFacet
} from "../../../../facets/assetCapabilities/scheduledTasks/scheduledBalanceAdjustments/sustainabilityPerformanceTargetRate/ScheduledBalanceAdjustmentsSustainabilityPerformanceTargetRateFacet.sol";
// solhint-enable max-line-length
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

// solhint-disable-next-line no-empty-blocks
contract ScheduledBalanceAdjustmentsSustainabilityPerformanceTargetRateFacetTimeTravel is
    ScheduledBalanceAdjustmentsSustainabilityPerformanceTargetRateFacet,
    TimeTravelStorageWrapper
{}
