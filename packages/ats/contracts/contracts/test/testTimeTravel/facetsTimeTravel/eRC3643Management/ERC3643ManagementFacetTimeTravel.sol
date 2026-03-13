// SPDX-License-Identifier: Apache-2.0
// Contract copy-pasted form OZ and extended

pragma solidity >=0.8.0 <0.9.0;

import { ERC3643ManagementFacet } from "../../../../facets/layer_1/ERC3643/ERC3643ManagementFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

contract ERC3643ManagementFacetTimeTravel is ERC3643ManagementFacet, TimeTravelStorageWrapper {}
