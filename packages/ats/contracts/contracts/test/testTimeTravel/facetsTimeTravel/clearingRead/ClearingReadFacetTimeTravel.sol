// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ClearingReadFacet } from "../../../../facets/layer_1/clearing/ClearingReadFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

contract ClearingReadFacetTimeTravel is ClearingReadFacet, TimeTravelStorageWrapper {}
