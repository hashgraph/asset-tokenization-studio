// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ClearingHoldCreationFacet } from "../../../../facets/layer_1/clearing/ClearingHoldCreationFacet.sol";
import { TimeTravelProvider } from "../../timeTravel/TimeTravelProvider.sol";

contract ClearingHoldCreationFacetTimeTravel is ClearingHoldCreationFacet, TimeTravelProvider {
    // solhint-disable-next-line no-empty-blocks
}
