// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { KpiLinkedRateFacet } from "../../../../facets/layer_2/interestRate/kpiLinkedRate/KpiLinkedRateFacet.sol";
import { TimeTravelProvider } from "../../timeTravel/TimeTravelProvider.sol";

contract KpiLinkedRateFacetTimeTravel is KpiLinkedRateFacet, TimeTravelProvider {
    // solhint-disable-next-line no-empty-blocks
}
