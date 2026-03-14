// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    ExternalControlListManagementFacet
} from "../../../../facets/layer_1/externalControlList/ExternalControlListManagementFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

contract ExternalControlListManagementFacetTimeTravel is ExternalControlListManagementFacet, TimeTravelStorageWrapper {
    // solhint-disable-previous-line no-empty-blocks
}
