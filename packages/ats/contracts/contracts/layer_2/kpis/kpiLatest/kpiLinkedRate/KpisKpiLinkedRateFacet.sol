// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { KpisFacetBase } from "../KpisFacetBase.sol";
import {
    CommonKpiLinkedInterestRate
} from "../../../../layer_0_extensions/bond/fixingDateInterestRate/kpiInterestRate/kpiLinkedInterestRate/Common.sol";
import { _KPIS_LATEST_KPI_LINKED_RATE_RESOLVER_KEY } from "../../../constants/resolverKeys.sol";

contract KpisKpiLinkedRateFacet is KpisFacetBase, CommonKpiLinkedInterestRate {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _KPIS_LATEST_KPI_LINKED_RATE_RESOLVER_KEY;
    }
}
