// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ControlListFacet } from "../../../../facets/features/controlList/ControlListFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

// solhint-disable-next-line no-empty-blocks
contract ControlListFacetTimeTravel is ControlListFacet, TimeTravelStorageWrapper {}
