// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ClearingHoldCreationFacet } from "../../../../facets/layer_1/clearing/ClearingHoldCreationFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

contract ClearingHoldCreationFacetTimeTravel is ClearingHoldCreationFacet, TimeTravelStorageWrapper {
    // solhint-disable-previous-line no-empty-blocks
}
