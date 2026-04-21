// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { TotalBalanceFacet } from "../../../../facets/layer_1/totalBalance/TotalBalanceFacet.sol";
import { TimeTravelProvider } from "../../timeTravel/TimeTravelProvider.sol";

contract TotalBalanceFacetTimeTravel is TotalBalanceFacet, TimeTravelProvider {}
