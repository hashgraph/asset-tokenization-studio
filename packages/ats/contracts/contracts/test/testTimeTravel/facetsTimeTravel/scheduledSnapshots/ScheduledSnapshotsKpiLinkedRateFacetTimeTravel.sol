// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// solhint-disable max-line-length
import {
    ScheduledSnapshotsKpiLinkedRateFacet
} from "../../../../facets/assetCapabilities/scheduledTasks/scheduledSnapshots/kpiLinkedRate/ScheduledSnapshotsKpiLinkedRateFacet.sol";
// solhint-enable max-line-length
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

// solhint-disable-next-line no-empty-blocks
contract ScheduledSnapshotsKpiLinkedRateFacetTimeTravel is
    ScheduledSnapshotsKpiLinkedRateFacet,
    TimeTravelStorageWrapper
{}
