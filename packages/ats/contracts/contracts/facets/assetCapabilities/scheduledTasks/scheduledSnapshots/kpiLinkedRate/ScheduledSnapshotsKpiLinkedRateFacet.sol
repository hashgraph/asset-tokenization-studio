// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _SCHEDULED_SNAPSHOTS_KPI_LINKED_RATE_RESOLVER_KEY } from "../../../../../constants/resolverKeys/assets.sol";
import { ScheduledSnapshotsFacetBase } from "../ScheduledSnapshotsFacetBase.sol";

contract ScheduledSnapshotsKpiLinkedRateFacet is ScheduledSnapshotsFacetBase {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _SCHEDULED_SNAPSHOTS_KPI_LINKED_RATE_RESOLVER_KEY;
    }
}
