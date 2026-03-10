// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { KpisFacetBase } from "../KpisFacetBase.sol";
/* solhint-disable max-line-length */
import {
    CommonSustainabilityPerformanceTargetInterestRate
} from "../../../../../domain/asset/extension/bond/fixingDateInterestRate/kpiInterestRate/sustainabilityPerformanceTargetInterestRate/Common.sol";
/* solhint-enable max-line-length */
import {
    _KPIS_LATEST_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY
} from "../../../../../constants/resolverKeys.sol";

contract KpisSustainabilityPerformanceTargetRateFacet is
    KpisFacetBase,
    CommonSustainabilityPerformanceTargetInterestRate
{
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _KPIS_LATEST_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY;
    }
}
