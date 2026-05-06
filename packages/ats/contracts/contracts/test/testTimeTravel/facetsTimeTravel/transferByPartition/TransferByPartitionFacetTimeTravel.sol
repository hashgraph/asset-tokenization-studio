// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { TransferByPartitionFacet } from "../../../../facets/transferByPartition/TransferByPartitionFacet.sol";
import { TimeTravelProvider } from "../../timeTravel/TimeTravelProvider.sol";

contract TransferByPartitionFacetTimeTravel is TransferByPartitionFacet, TimeTravelProvider {
    // solhint-disable-next-line no-empty-blocks
}
