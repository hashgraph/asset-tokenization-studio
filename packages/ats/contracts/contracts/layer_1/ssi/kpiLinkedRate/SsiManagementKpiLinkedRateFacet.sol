// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { SsiManagementFacetBase } from "../SsiManagementFacetBase.sol";
import { _SSI_KPI_LINKED_RATE_RESOLVER_KEY } from "../../constants/resolverKeys.sol";
import {
    CommonKpiLinkedInterestRate
} from "../../../layer_0_extensions/bond/fixingDateInterestRate/kpiInterestRate/kpiLinkedInterestRate/Common.sol";

contract SsiManagementKpiLinkedRateFacet is SsiManagementFacetBase, CommonKpiLinkedInterestRate {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _SSI_KPI_LINKED_RATE_RESOLVER_KEY;
    }
}
