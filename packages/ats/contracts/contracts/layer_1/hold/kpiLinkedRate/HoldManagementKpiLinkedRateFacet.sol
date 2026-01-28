// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { HoldManagementFacetBase } from "../HoldManagementFacetBase.sol";
import { _HOLD_KPI_LINKED_RATE_RESOLVER_KEY } from "../../../layer_1/constants/resolverKeys.sol";
import {
    CommonKpiLinkedInterestRate
} from "../../../layer_0_extensions/bond/fixingDateInterestRate/kpiInterestRate/kpiLinkedInterestRate/Common.sol";

contract HoldManagementKpiLinkedRateFacet is HoldManagementFacetBase, CommonKpiLinkedInterestRate {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _HOLD_KPI_LINKED_RATE_RESOLVER_KEY;
    }
}
