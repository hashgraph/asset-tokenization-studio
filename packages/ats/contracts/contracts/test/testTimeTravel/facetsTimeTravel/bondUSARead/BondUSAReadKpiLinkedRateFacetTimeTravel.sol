// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    BondUSAReadKpiLinkedRateFacet
} from "../../../../facets/layer_3/bondUSA/kpiLinkedRate/BondUSAReadKpiLinkedRateFacet.sol";
import { TimeTravelProvider } from "../../timeTravel/TimeTravelProvider.sol";

contract BondUSAReadKpiLinkedRateFacetTimeTravel is BondUSAReadKpiLinkedRateFacet, TimeTravelProvider {}
