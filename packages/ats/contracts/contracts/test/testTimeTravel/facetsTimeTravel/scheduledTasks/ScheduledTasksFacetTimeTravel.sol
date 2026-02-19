// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// solhint-disable max-line-length
import {
    ScheduledCrossOrderedTasksFacet
} from "../../../../facets/assetCapabilities/scheduledTasks/scheduledCrossOrderedTasks/standard/ScheduledCrossOrderedTasksFacet.sol";
// solhint-enable max-line-length
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

contract ScheduledCrossOrderedTasksFacetTimeTravel is ScheduledCrossOrderedTasksFacet, TimeTravelStorageWrapper {
    function _getBlockTimestamp() internal view override returns (uint256) {
        return TimeTravelStorageWrapper._blockTimestamp();
    }
}
