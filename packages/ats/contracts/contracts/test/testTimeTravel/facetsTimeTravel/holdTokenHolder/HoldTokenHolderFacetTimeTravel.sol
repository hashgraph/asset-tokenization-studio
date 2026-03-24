// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { TimeTravelProvider } from "../../timeTravel/TimeTravelProvider.sol";
import { HoldTokenHolderFacet } from "../../../../facets/layer_1/hold/HoldTokenHolderFacet.sol";

contract HoldTokenHolderFacetTimeTravel is HoldTokenHolderFacet, TimeTravelProvider {
    // solhint-disable-next-line no-empty-blocks
}
