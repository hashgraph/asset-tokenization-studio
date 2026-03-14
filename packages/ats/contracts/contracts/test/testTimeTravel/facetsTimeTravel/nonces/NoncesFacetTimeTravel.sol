// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { NoncesFacet } from "../../../../facets/layer_1/nonce/NoncesFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

contract NoncesFacetTimeTravel is NoncesFacet, TimeTravelStorageWrapper {
    // solhint-disable-previous-line no-empty-blocks
}
