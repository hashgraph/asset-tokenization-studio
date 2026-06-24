// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { KpisFacet } from "../../../../facets/kpi/KpisFacet.sol";
import { TimeTravelProvider } from "../../timeTravel/TimeTravelProvider.sol";

contract KpisFacetTimeTravel is KpisFacet, TimeTravelProvider {
    // solhint-disable-next-line no-empty-blocks
}
