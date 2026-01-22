// SPDX-License-Identifier: Apache-2.0
// Contract copy-pasted form OZ and extended
pragma solidity >=0.8.0 <0.9.0;

import { ERC20FacetBase } from "../ERC20FacetBase.sol";
import { _ERC20_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY } from "../../../constants/resolverKeys.sol";
import {
    CommonSustainabilityPerformanceTargetInterestRate
// solhint-disable-next-line max-line-length
} from "contracts/layer_0_extensions/bond/fixingDateInterestRate/kpiInterestRate/sustainabilityPerformanceTargetInterestRate/Common.sol";

contract ERC20SustainabilityPerformanceTargetRateFacet is
    ERC20FacetBase,
    CommonSustainabilityPerformanceTargetInterestRate
{
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _ERC20_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY;
    }
}
