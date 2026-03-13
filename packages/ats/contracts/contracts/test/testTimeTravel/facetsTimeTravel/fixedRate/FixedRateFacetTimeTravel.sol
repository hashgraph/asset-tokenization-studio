// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { FixedRateFacet } from "../../../../facets/layer_2/interestRate/fixedRate/FixedRateFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

contract FixedRateFacetTimeTravel is FixedRateFacet, TimeTravelStorageWrapper {}
