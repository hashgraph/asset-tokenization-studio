// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { KycFacetBase } from "../KycFacetBase.sol";
import { _KYC_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY } from "../../constants/resolverKeys.sol";
// prettier-ignore
// solhint-disable-next-line max-line-length
import { CommonSustainabilityPerformanceTargetInterestRate } from "../../../layer_0_extensions/bond/fixingDateInterestRate/kpiInterestRate/sustainabilityPerformanceTargetInterestRate/Common.sol";

contract KycSustainabilityPerformanceTargetRateFacet is
    KycFacetBase,
    CommonSustainabilityPerformanceTargetInterestRate
{
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _KYC_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY;
    }
}
