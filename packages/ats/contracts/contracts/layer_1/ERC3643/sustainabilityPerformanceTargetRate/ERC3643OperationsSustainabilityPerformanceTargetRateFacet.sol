// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    _ERC3643_OPERATIONS_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY
} from "../../constants/resolverKeys.sol";
import { ERC3643OperationsFacetBase } from "../ERC3643OperationsFacetBase.sol";
import {
    CommonSustainabilityPerformanceTargetInterestRate
} from "../../../layer_0_extensions/bond/fixingDateInterestRate/kpiInterestRate/sustainabilityPerformanceTargetInterestRate/Common.sol";

contract ERC3643OperationsSustainabilityPerformanceTargetRateFacet is
    ERC3643OperationsFacetBase,
    CommonSustainabilityPerformanceTargetInterestRate
{
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _ERC3643_OPERATIONS_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY;
    }
}
