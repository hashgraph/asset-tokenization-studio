// SPDX-License-Identifier: Apache-2.0
// Contract copy-pasted form OZ and extended

pragma solidity >=0.8.0 <0.9.0;

import { FreezeFacet } from "../../../../facets/layer_1/freeze/FreezeFacet.sol";
import { TimeTravelProvider } from "../../timeTravel/TimeTravelProvider.sol";

contract FreezeFacetTimeTravel is FreezeFacet, TimeTravelProvider {}
