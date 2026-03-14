// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { EquityUSAFacet } from "../../../../facets/layer_3/equityUSA/EquityUSAFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

contract EquityUSAFacetTimeTravel is EquityUSAFacet, TimeTravelStorageWrapper {
    // solhint-disable-previous-line no-empty-blocks
}
