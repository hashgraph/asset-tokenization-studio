// SPDX-License-Identifier: Apache-2.0
// Contract copy-pasted form OZ and extended

pragma solidity >=0.8.0 <0.9.0;

import { HoldFacet } from "../../../../facets/hold/HoldFacet.sol";
import { TimeTravelProvider } from "../../timeTravel/TimeTravelProvider.sol";

contract HoldFacetTimeTravel is HoldFacet, TimeTravelProvider {
    // solhint-disable-next-line no-empty-blocks
}
