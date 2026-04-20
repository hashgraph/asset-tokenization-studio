// SPDX-License-Identifier: Apache-2.0
// Contract copy-pasted form OZ and extended

pragma solidity >=0.8.0 <0.9.0;

import { ERC20Facet } from "../../../../facets/layer_1/ERC1400/ERC20/ERC20Facet.sol";
import { TimeTravelProvider } from "../../timeTravel/TimeTravelProvider.sol";

contract ERC20FacetTimeTravel is ERC20Facet, TimeTravelProvider {}
