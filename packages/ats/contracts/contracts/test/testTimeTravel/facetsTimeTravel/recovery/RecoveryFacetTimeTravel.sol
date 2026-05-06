// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { RecoveryFacet } from "../../../../facets/recovery/RecoveryFacet.sol";
import { TimeTravelProvider } from "../../timeTravel/TimeTravelProvider.sol";

contract RecoveryFacetTimeTravel is RecoveryFacet, TimeTravelProvider {
    // solhint-disable-next-line no-empty-blocks
}
