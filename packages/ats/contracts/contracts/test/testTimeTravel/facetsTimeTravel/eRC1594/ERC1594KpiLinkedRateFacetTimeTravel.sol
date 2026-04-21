// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ERC1594Facet } from "../../../../facets/layer_1/ERC1400/ERC1594/ERC1594Facet.sol";
import { TimeTravelProvider } from "../../timeTravel/TimeTravelProvider.sol";

contract ERC1594KpiLinkedRateFacetTimeTravel is ERC1594Facet, TimeTravelProvider {}
