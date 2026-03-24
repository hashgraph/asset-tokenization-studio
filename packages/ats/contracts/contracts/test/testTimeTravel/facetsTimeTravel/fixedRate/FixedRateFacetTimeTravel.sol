// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { FixedRateFacet } from "../../../../facets/layer_2/interestRate/fixedRate/FixedRateFacet.sol";
import { TimeTravelProvider } from "../../timeTravel/TimeTravelProvider.sol";

contract FixedRateFacetTimeTravel is FixedRateFacet, TimeTravelProvider {
    // solhint-disable-next-line no-empty-blocks
}
