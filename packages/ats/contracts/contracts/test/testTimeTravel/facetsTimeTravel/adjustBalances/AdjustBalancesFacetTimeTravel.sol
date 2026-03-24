// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { AdjustBalancesFacet } from "../../../../facets/layer_2/adjustBalance/AdjustBalancesFacet.sol";
import { TimeTravelProvider } from "../../timeTravel/TimeTravelProvider.sol";

contract AdjustBalancesFacetTimeTravel is AdjustBalancesFacet, TimeTravelProvider {
    // solhint-disable-next-line no-empty-blocks
}
