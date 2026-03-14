// SPDX-License-Identifier: Apache-2.0
// Contract copy-pasted form OZ and extended

pragma solidity >=0.8.0 <0.9.0;

import { ERC20VotesFacet } from "../../../../facets/layer_1/ERC1400/ERC20Votes/ERC20VotesFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

contract ERC20VotesFacetTimeTravel is ERC20VotesFacet, TimeTravelStorageWrapper {
    // solhint-disable-previous-line no-empty-blocks
}
