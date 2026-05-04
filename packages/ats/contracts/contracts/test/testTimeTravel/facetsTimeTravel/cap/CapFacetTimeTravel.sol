// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { CapFacet } from "../../../../facets/cap/CapFacet.sol";
import { TimeTravelProvider } from "../../timeTravel/TimeTravelProvider.sol";

contract CapFacetTimeTravel is CapFacet, TimeTravelProvider {}
