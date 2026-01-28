// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ExternalKycListManagementFacetBase } from "../ExternalKycListManagementFacetBase.sol";
import { _EXTERNAL_KYC_LIST_KPI_LINKED_RATE_RESOLVER_KEY } from "../../../layer_1/constants/resolverKeys.sol";
import {
    CommonKpiLinkedInterestRate
} from "../../../layer_0_extensions/bond/fixingDateInterestRate/kpiInterestRate/kpiLinkedInterestRate/Common.sol";

contract ExternalKycListManagementKpiLinkedRateFacet is
    ExternalKycListManagementFacetBase,
    CommonKpiLinkedInterestRate
{
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _EXTERNAL_KYC_LIST_KPI_LINKED_RATE_RESOLVER_KEY;
    }
}
