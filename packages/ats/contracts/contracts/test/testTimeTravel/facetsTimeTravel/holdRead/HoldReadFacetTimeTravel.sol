// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { HoldReadFacet } from "../../../../facets/layer_1/hold/HoldReadFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

contract HoldReadFacetTimeTravel is HoldReadFacet, TimeTravelStorageWrapper {
    // solhint-disable-previous-line no-empty-blocks
}
