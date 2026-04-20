// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { BondUSAFacet } from "../../../../facets/layer_3/bondUSA/variableRate/BondUSAFacet.sol";
import { TimeTravelProvider } from "../../timeTravel/TimeTravelProvider.sol";

contract BondUSAFacetTimeTravel is BondUSAFacet, TimeTravelProvider {}
