// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ERC1643Facet } from "../../../../facets/features/ERC1400/ERC1643/ERC1643Facet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

// solhint-disable-next-line no-empty-blocks
contract ERC1643FacetTimeTravel is ERC1643Facet, TimeTravelStorageWrapper {}
