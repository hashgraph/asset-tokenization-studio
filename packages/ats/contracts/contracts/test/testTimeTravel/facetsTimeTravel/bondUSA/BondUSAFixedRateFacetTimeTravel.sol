// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { BondUSAFixedRateFacet } from "../../../../facets/layer_3/bondUSA/fixedRate/BondUSAFixedRateFacet.sol";
import { TimeTravelProvider } from "../../timeTravel/TimeTravelProvider.sol";

contract BondUSAFixedRateFacetTimeTravel is BondUSAFixedRateFacet, TimeTravelProvider {}
