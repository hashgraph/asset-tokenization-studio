// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { KpisKpiLinkedRateFacet } from "../../../../facets/layer_2/kpi/kpiLatest/KpisKpiLinkedRateFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

contract KpisKpiLinkedRateFacetTimeTravel is KpisKpiLinkedRateFacet, TimeTravelStorageWrapper {
    // solhint-disable-previous-line no-empty-blocks
}
