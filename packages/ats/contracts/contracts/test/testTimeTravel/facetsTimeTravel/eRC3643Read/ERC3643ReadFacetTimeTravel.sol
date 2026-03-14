// SPDX-License-Identifier: Apache-2.0
// Contract copy-pasted form OZ and extended

pragma solidity >=0.8.0 <0.9.0;

import { ERC3643ReadFacet } from "../../../../facets/layer_1/ERC3643/ERC3643ReadFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

contract ERC3643ReadFacetTimeTravel is ERC3643ReadFacet, TimeTravelStorageWrapper {
    // solhint-disable-previous-line no-empty-blocks
}
