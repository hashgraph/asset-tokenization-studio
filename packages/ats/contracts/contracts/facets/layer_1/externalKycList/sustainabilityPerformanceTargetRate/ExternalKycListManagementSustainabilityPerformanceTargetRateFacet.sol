// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ExternalKycListManagementFacetBase } from "../ExternalKycListManagementFacetBase.sol";
import {
    _EXTERNAL_KYC_LIST_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY
} from "../../../../constants/resolverKeys.sol";
/* solhint-disable max-line-length */
import {
    CommonSustainabilityPerformanceTargetInterestRate
} from "../../../../domain/asset/extension/bond/fixingDateInterestRate/kpiInterestRate/sustainabilityPerformanceTargetInterestRate/Common.sol";
/* solhint-enable max-line-length */

contract ExternalKycListManagementSustainabilityPerformanceTargetRateFacet is
    ExternalKycListManagementFacetBase,
    CommonSustainabilityPerformanceTargetInterestRate
{
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _EXTERNAL_KYC_LIST_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY;
    }
}
