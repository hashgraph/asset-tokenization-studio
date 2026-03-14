// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { BondUSAFixedRateFacet } from "../../../../facets/layer_3/bondUSA/fixedRate/BondUSAFixedRateFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

contract BondUSAFixedRateFacetTimeTravel is BondUSAFixedRateFacet, TimeTravelStorageWrapper {
    // solhint-disable-previous-line no-empty-blocks
}
