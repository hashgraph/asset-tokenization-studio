// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { NoncesFacet } from "../../../../facets/nonces/NoncesFacet.sol";
import { TimeTravelProvider } from "../../timeTravel/TimeTravelProvider.sol";

contract NoncesFacetTimeTravel is NoncesFacet, TimeTravelProvider {
    // solhint-disable-next-line no-empty-blocks
}
