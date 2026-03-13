// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ControlListFacet } from "../../../../facets/layer_1/controlList/ControlListFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

contract ControlListFacetTimeTravel is ControlListFacet, TimeTravelStorageWrapper {}
