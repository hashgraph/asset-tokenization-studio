// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ERC3643ReadFacet } from "../../../../facets/features/ERC3643/standard/ERC3643ReadFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

// solhint-disable-next-line no-empty-blocks
contract ERC3643ReadFacetTimeTravel is ERC3643ReadFacet, TimeTravelStorageWrapper {}
