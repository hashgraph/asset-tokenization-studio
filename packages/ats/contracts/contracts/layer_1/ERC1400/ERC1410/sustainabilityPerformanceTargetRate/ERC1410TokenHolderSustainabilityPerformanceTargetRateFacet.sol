// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ERC1410TokenHolderFacetBase } from "../ERC1410TokenHolderFacetBase.sol";
import {
    _ERC1410_TOKEN_HOLDER_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY
} from "contracts/layer_1/constants/resolverKeys.sol";
import {
    CommonSustainabilityPerformanceTargetInterestRate
// solhint-disable-next-line max-line-length    
} from "contracts/layer_0_extensions/bond/fixingDateInterestRate/kpiInterestRate/sustainabilityPerformanceTargetInterestRate/Common.sol";

contract ERC1410TokenHolderSustainabilityPerformanceTargetRateFacet is
    ERC1410TokenHolderFacetBase,
    CommonSustainabilityPerformanceTargetInterestRate
{
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _ERC1410_TOKEN_HOLDER_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY;
    }
}
