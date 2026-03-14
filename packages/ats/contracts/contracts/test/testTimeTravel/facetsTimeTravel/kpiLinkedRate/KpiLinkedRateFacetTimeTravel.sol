// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { KpiLinkedRateFacet } from "../../../../facets/layer_2/interestRate/kpiLinkedRate/KpiLinkedRateFacet.sol";
import { TimeTravelStorageWrapper } from "../../timeTravel/TimeTravelStorageWrapper.sol";

contract KpiLinkedRateFacetTimeTravel is KpiLinkedRateFacet, TimeTravelStorageWrapper {
    // solhint-disable-previous-line no-empty-blocks
}
