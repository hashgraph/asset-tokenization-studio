// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { TotalBalanceFacetBase } from "../TotalBalanceFacetBase.sol";
import { _TOTAL_BALANCE_KPI_LINKED_RATE_RESOLVER_KEY } from "../../../layer_1/constants/resolverKeys.sol";
import {
    CommonKpiLinkedInterestRate
} from "../../../layer_0_extensions/bond/fixingDateInterestRate/kpiInterestRate/kpiLinkedInterestRate/Common.sol";

contract TotalBalanceKpiLinkedRateFacet is TotalBalanceFacetBase, CommonKpiLinkedInterestRate {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _TOTAL_BALANCE_KPI_LINKED_RATE_RESOLVER_KEY;
    }
}
