// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    ExternalPauseManagementFacet
} from "../../../../facets/features/externalPauses/ExternalPauseManagementFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

// solhint-disable-next-line no-empty-blocks
contract ExternalPauseManagementFacetTimeTravel is ExternalPauseManagementFacet, TimeTravelStorageWrapper {}
