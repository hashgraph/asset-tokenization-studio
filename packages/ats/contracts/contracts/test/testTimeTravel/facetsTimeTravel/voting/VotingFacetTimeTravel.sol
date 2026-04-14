// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { VotingFacet } from "../../../../facets/layer_2/voting/VotingFacet.sol";
import { TimeTravelProvider } from "../../timeTravel/TimeTravelProvider.sol";

contract VotingFacetTimeTravel is VotingFacet, TimeTravelProvider {
    // solhint-disable-next-line no-empty-blocks
}
