// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { LockFacet } from "../../../../facets/layer_1/lock/LockFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

contract LockFacetTimeTravel is LockFacet, TimeTravelStorageWrapper {}
