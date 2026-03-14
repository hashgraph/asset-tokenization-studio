// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { BondUSAReadFacet } from "../../../../facets/layer_3/bondUSA/variableRate/BondUSAReadFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

contract BondUSAReadFacetTimeTravel is BondUSAReadFacet, TimeTravelStorageWrapper {
    // solhint-disable-previous-line no-empty-blocks
}
