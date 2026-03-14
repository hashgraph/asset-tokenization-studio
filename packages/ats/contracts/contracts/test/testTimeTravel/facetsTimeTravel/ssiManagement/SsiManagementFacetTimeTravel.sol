// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { SsiManagementFacet } from "../../../../facets/layer_1/ssi/SsiManagementFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

contract SsiManagementFacetTimeTravel is SsiManagementFacet, TimeTravelStorageWrapper {
    // solhint-disable-previous-line no-empty-blocks
}
