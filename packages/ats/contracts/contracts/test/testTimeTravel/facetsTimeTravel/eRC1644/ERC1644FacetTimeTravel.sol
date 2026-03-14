// SPDX-License-Identifier: Apache-2.0
// Contract copy-pasted form OZ and extended

pragma solidity >=0.8.0 <0.9.0;

import { ERC1644Facet } from "../../../../facets/layer_1/ERC1400/ERC1644/ERC1644Facet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

contract ERC1644FacetTimeTravel is ERC1644Facet, TimeTravelStorageWrapper {
    // solhint-disable-previous-line no-empty-blocks
}
