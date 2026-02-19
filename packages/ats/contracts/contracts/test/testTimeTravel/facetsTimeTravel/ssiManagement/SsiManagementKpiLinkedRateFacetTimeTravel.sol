// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    SsiManagementKpiLinkedRateFacet
} from "../../../../facets/features/ssi/kpiLinkedRate/SsiManagementKpiLinkedRateFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

// solhint-disable-next-line no-empty-blocks
contract SsiManagementKpiLinkedRateFacetTimeTravel is SsiManagementKpiLinkedRateFacet, TimeTravelStorageWrapper {}
