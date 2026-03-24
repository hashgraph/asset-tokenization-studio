// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { PauseFacet } from "../../../../facets/layer_1/pause/PauseFacet.sol";
import { TimeTravelProvider } from "../../timeTravel/TimeTravelProvider.sol";

contract PauseFacetTimeTravel is PauseFacet, TimeTravelProvider {
    // solhint-disable-next-line no-empty-blocks
}
