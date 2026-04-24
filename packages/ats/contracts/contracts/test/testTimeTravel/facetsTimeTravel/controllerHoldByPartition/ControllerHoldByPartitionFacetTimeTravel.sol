// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { TimeTravelProvider } from "../../timeTravel/TimeTravelProvider.sol";
import { ControllerHoldByPartitionFacet } from "../../../../facets/controllerHoldByPartition/ControllerHoldByPartitionFacet.sol";

contract ControllerHoldByPartitionFacetTimeTravel is ControllerHoldByPartitionFacet, TimeTravelProvider {
    // solhint-disable-next-line no-empty-blocks
}
