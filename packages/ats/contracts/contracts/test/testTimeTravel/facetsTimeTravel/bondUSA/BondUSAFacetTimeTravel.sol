// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { BondUSAFacet } from "../../../../facets/layer_3/bondUSA/variableRate/BondUSAFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

contract BondUSAFacetTimeTravel is BondUSAFacet, TimeTravelStorageWrapper {
    // solhint-disable-previous-line no-empty-blocks
}
