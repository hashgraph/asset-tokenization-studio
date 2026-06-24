// SPDX-License-Identifier: Apache-2.0

pragma solidity >=0.8.0 <0.9.0;

import { DiamondFacet } from "../../../../infrastructure/diamond/DiamondFacet.sol";
import { TimeTravelProvider } from "../../timeTravel/TimeTravelProvider.sol";

contract DiamondFacetTimeTravel is DiamondFacet, TimeTravelProvider {
    // solhint-disable-next-line no-empty-blocks
}
