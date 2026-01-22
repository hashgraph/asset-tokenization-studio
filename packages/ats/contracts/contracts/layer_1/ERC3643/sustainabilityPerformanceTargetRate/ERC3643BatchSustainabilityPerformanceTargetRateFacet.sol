// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _ERC3643_BATCH_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY } from "../../constants/resolverKeys.sol";
import { ERC3643BatchFacetBase } from "../ERC3643BatchFacetBase.sol";
import {
    CommonSustainabilityPerformanceTargetInterestRate
// solhint-disable-next-line max-line-length    
} from "../../../layer_0_extensions/bond/fixingDateInterestRate/kpiInterestRate/sustainabilityPerformanceTargetInterestRate/Common.sol";

contract ERC3643BatchSustainabilityPerformanceTargetRateFacet is
    ERC3643BatchFacetBase,
    CommonSustainabilityPerformanceTargetInterestRate
{
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _ERC3643_BATCH_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY;
    }
}
