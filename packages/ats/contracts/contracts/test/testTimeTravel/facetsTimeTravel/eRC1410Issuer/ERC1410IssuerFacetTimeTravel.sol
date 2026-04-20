// SPDX-License-Identifier: Apache-2.0
// Contract copy-pasted form OZ and extended

pragma solidity >=0.8.0 <0.9.0;

import { ERC1410IssuerFacet } from "../../../../facets/layer_1/ERC1400/ERC1410/ERC1410IssuerFacet.sol";
import { TimeTravelProvider } from "../../timeTravel/TimeTravelProvider.sol";

contract ERC1410IssuerFacetTimeTravel is ERC1410IssuerFacet, TimeTravelProvider {}
