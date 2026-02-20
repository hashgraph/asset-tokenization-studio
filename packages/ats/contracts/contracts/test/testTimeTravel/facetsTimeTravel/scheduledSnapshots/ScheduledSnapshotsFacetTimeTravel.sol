// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    ScheduledSnapshotsFacet
} from "../../../../facets/assetCapabilities/scheduledTasks/scheduledSnapshots/ScheduledSnapshotsFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

// solhint-disable-next-line no-empty-blocks
contract ScheduledSnapshotsFacetTimeTravel is ScheduledSnapshotsFacet, TimeTravelStorageWrapper {}
