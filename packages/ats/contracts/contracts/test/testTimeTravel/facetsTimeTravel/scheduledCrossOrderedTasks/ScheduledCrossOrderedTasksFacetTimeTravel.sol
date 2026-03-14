// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    ScheduledCrossOrderedTasksFacet
} from "../../../../facets/layer_2/scheduledTask/scheduledCrossOrderedTask/ScheduledCrossOrderedTasksFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

contract ScheduledCrossOrderedTasksFacetTimeTravel is ScheduledCrossOrderedTasksFacet, TimeTravelStorageWrapper {
    // solhint-disable-previous-line no-empty-blocks
}
