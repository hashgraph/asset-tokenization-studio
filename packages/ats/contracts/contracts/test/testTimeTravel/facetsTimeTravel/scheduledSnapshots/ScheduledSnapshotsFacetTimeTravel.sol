// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    ScheduledSnapshotsFacet
} from "../../../../facets/layer_2/scheduledTask/scheduledSnapshot/ScheduledSnapshotsFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

contract ScheduledSnapshotsFacetTimeTravel is ScheduledSnapshotsFacet, TimeTravelStorageWrapper {}
