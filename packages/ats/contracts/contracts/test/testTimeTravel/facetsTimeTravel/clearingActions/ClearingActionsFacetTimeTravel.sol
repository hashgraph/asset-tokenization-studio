// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ClearingActionsFacet } from "../../../../facets/layer_1/clearing/ClearingActionsFacet.sol";
import { TimeTravelProvider } from "../../timeTravel/TimeTravelProvider.sol";

contract ClearingActionsFacetTimeTravel is ClearingActionsFacet, TimeTravelProvider {
    // solhint-disable-next-line no-empty-blocks
}
