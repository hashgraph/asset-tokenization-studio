// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { SnapshotsFacet } from "../../../../facets/layer_1/snapshot/SnapshotsFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

contract SnapshotsFacetTimeTravel is SnapshotsFacet, TimeTravelStorageWrapper {
    // solhint-disable-previous-line no-empty-blocks
}
