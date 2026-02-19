// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// solhint-disable max-line-length
import {
    ScheduledCrossOrderedTasksKpiLinkedRateFacet as K
} from "../../../../facets/assetCapabilities/scheduledTasks/scheduledCrossOrderedTasks/kpiLinkedRate/ScheduledCrossOrderedTasksKpiLinkedRateFacet.sol";
// solhint-enable max-line-length
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

// solhint-disable-next-line no-empty-blocks
contract ScheduledCrossOrderedTasksKpiLinkedRateFacetTimeTravel is K, TimeTravelStorageWrapper {
    function _getBlockTimestamp() internal view override returns (uint256) {
        return TimeTravelStorageWrapper._blockTimestamp();
    }
}
