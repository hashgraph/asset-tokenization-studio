// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ProtectedPartitionsFacet } from "../../../../facets/layer_1/protectedPartition/ProtectedPartitionsFacet.sol";
import { TimeTravelProvider } from "../../timeTravel/TimeTravelProvider.sol";

contract ProtectedPartitionsFacetTimeTravel is ProtectedPartitionsFacet, TimeTravelProvider {
    // solhint-disable-next-line no-empty-blocks
}
