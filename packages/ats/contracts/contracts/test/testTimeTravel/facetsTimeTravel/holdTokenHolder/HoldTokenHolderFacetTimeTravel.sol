// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";
import { HoldTokenHolderFacet } from "../../../../facets/layer_1/hold/HoldTokenHolderFacet.sol";

contract HoldTokenHolderFacetTimeTravel is HoldTokenHolderFacet, TimeTravelStorageWrapper {}
