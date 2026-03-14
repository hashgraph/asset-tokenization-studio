// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    ExternalKycListManagementFacet
} from "../../../../facets/layer_1/externalKycList/ExternalKycListManagementFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

contract ExternalKycListManagementFacetTimeTravel is ExternalKycListManagementFacet, TimeTravelStorageWrapper {
    // solhint-disable-previous-line no-empty-blocks
}
