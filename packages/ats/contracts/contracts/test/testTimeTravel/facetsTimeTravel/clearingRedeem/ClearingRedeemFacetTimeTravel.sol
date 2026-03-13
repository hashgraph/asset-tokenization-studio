// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ClearingRedeemFacet } from "../../../../facets/layer_1/clearing/ClearingRedeemFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

contract ClearingRedeemFacetTimeTravel is ClearingRedeemFacet, TimeTravelStorageWrapper {}
