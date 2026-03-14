// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { BondUSAReadFixedRateFacet } from "../../../../facets/layer_3/bondUSA/fixedRate/BondUSAReadFixedRateFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

contract BondUSAReadFixedRateFacetTimeTravel is BondUSAReadFixedRateFacet, TimeTravelStorageWrapper {
    // solhint-disable-previous-line no-empty-blocks
}
