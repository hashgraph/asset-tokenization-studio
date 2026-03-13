// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    ExternalPauseManagementFacet
} from "../../../../facets/layer_1/externalPause/ExternalPauseManagementFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

contract ExternalPauseManagementFacetTimeTravel is ExternalPauseManagementFacet, TimeTravelStorageWrapper {}
