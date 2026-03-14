// SPDX-License-Identifier: Apache-2.0
// Contract copy-pasted form OZ and extended

pragma solidity >=0.8.0 <0.9.0;

import { ERC1410TokenHolderFacet } from "../../../../facets/layer_1/ERC1400/ERC1410/ERC1410TokenHolderFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

contract ERC1410TokenHolderFacetTimeTravel is ERC1410TokenHolderFacet, TimeTravelStorageWrapper {
    // solhint-disable-previous-line no-empty-blocks
}
