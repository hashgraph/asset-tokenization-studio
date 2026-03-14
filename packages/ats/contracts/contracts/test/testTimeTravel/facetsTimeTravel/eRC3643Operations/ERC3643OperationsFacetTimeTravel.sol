// SPDX-License-Identifier: Apache-2.0
// Contract copy-pasted form OZ and extended

pragma solidity >=0.8.0 <0.9.0;

import { ERC3643OperationsFacet } from "../../../../facets/layer_1/ERC3643/ERC3643OperationsFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

contract ERC3643OperationsFacetTimeTravel is ERC3643OperationsFacet, TimeTravelStorageWrapper {
    // solhint-disable-previous-line no-empty-blocks
}
