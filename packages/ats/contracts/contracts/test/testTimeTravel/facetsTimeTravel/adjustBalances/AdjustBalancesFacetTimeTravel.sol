// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { AdjustBalancesFacet } from "../../../../facets/layer_2/adjustBalance/AdjustBalancesFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

contract AdjustBalancesFacetTimeTravel is AdjustBalancesFacet, TimeTravelStorageWrapper {
    // solhint-disable-previous-line no-empty-blocks
}
