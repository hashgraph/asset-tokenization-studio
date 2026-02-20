// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    ExternalKycListManagementFacet
} from "../../../../facets/features/externalKycLists/ExternalKycListManagementFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

// solhint-disable-next-line no-empty-blocks
contract ExternalKycListManagementFacetTimeTravel is ExternalKycListManagementFacet, TimeTravelStorageWrapper {}
