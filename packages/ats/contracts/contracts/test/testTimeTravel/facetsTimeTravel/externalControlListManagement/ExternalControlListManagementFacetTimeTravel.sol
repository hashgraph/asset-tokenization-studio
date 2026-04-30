// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    ExternalControlListManagementFacet
} from "../../../../facets/externalControlListManagement/ExternalControlListManagementFacet.sol";
import { TimeTravelProvider } from "../../timeTravel/TimeTravelProvider.sol";

contract ExternalControlListManagementFacetTimeTravel is ExternalControlListManagementFacet, TimeTravelProvider {
    // solhint-disable-next-line no-empty-blocks
}
