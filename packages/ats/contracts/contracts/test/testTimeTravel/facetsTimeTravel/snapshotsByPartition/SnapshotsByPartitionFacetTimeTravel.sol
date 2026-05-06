// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { SnapshotsByPartitionFacet } from "../../../../facets/snapshotsByPartition/SnapshotsByPartitionFacet.sol";
import { TimeTravelProvider } from "../../timeTravel/TimeTravelProvider.sol";

contract SnapshotsByPartitionFacetTimeTravel is SnapshotsByPartitionFacet, TimeTravelProvider {
    // solhint-disable-next-line no-empty-blocks
}
