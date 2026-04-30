// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    ExternalPauseManagementFacet
} from "../../../../facets/externalPauseManagement/ExternalPauseManagementFacet.sol";
import { TimeTravelProvider } from "../../timeTravel/TimeTravelProvider.sol";

contract ExternalPauseManagementFacetTimeTravel is ExternalPauseManagementFacet, TimeTravelProvider {
    // solhint-disable-next-line no-empty-blocks
}
