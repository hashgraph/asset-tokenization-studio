// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { AccessControlFacet } from "../../../../facets/layer_1/accessControl/AccessControlFacet.sol";
import { TimeTravelProvider } from "../../timeTravel/TimeTravelProvider.sol";

contract AccessControlFacetTimeTravel is AccessControlFacet, TimeTravelProvider {
    // solhint-disable-next-line no-empty-blocks
}
