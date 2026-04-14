// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { DividendFacet } from "../../../../facets/layer_2/dividend/DividendFacet.sol";
import { TimeTravelProvider } from "../../timeTravel/TimeTravelProvider.sol";

contract DividendFacetTimeTravel is DividendFacet, TimeTravelProvider {
    // solhint-disable-next-line no-empty-blocks
}
