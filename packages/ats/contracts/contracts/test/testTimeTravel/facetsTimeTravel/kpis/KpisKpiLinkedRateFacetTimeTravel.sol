// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { KpisKpiLinkedRateFacet } from "../../../../facets/layer_2/kpi/kpiLatest/KpisKpiLinkedRateFacet.sol";
import { TimeTravelProvider } from "../../timeTravel/TimeTravelProvider.sol";

contract KpisKpiLinkedRateFacetTimeTravel is KpisKpiLinkedRateFacet, TimeTravelProvider {
    // solhint-disable-next-line no-empty-blocks
}
