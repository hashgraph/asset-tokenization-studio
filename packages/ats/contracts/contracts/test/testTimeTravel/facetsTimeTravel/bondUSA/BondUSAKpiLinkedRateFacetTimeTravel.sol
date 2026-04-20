// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    BondUSAKpiLinkedRateFacet
} from "../../../../facets/layer_3/bondUSA/kpiLinkedRate/BondUSAKpiLinkedRateFacet.sol";
import { TimeTravelProvider } from "../../timeTravel/TimeTravelProvider.sol";

contract BondUSAKpiLinkedRateFacetTimeTravel is BondUSAKpiLinkedRateFacet, TimeTravelProvider {}
