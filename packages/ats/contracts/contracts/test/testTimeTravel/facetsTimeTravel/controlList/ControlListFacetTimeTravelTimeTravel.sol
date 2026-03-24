// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ControlListFacet } from "../../../../facets/layer_1/controlList/ControlListFacet.sol";
import { TimeTravelProvider } from "../../timeTravel/TimeTravelProvider.sol";

contract ControlListFacetTimeTravel is ControlListFacet, TimeTravelProvider {
    // solhint-disable-next-line no-empty-blocks
}
