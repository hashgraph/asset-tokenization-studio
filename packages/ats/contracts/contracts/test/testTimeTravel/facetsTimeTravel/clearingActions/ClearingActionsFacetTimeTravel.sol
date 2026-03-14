// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ClearingActionsFacet } from "../../../../facets/layer_1/clearing/ClearingActionsFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

contract ClearingActionsFacetTimeTravel is ClearingActionsFacet, TimeTravelStorageWrapper {
    // solhint-disable-previous-line no-empty-blocks
}
