// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { PauseFacet } from "../../../../facets/layer_1/pause/PauseFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

contract PauseFacetTimeTravel is PauseFacet, TimeTravelStorageWrapper {
    // solhint-disable-previous-line no-empty-blocks
}
