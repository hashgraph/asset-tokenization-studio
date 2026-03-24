// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    ExternalKycListManagementFacet
} from "../../../../facets/layer_1/externalKycList/ExternalKycListManagementFacet.sol";
import { TimeTravelProvider } from "../../timeTravel/TimeTravelProvider.sol";

contract ExternalKycListManagementFacetTimeTravel is ExternalKycListManagementFacet, TimeTravelProvider {
    // solhint-disable-next-line no-empty-blocks
}
