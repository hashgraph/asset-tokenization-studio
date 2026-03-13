// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { TotalBalanceFacet } from "../../../../facets/layer_1/totalBalance/TotalBalanceFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

contract TotalBalanceFacetTimeTravel is TotalBalanceFacet, TimeTravelStorageWrapper {}
