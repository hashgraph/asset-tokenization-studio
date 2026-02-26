// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { HoldTokenHolderFacetBase } from "../HoldTokenHolderFacetBase.sol";
import {
    _HOLD_TOKEN_HOLDER_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY
} from "../../constants/resolverKeys.sol";
// prettier-ignore
// solhint-disable-next-line max-line-length
import { CommonSustainabilityPerformanceTargetInterestRate } from "../../../layer_0_extensions/bond/fixingDateInterestRate/kpiInterestRate/sustainabilityPerformanceTargetInterestRate/Common.sol";

contract HoldTokenHolderSustainabilityPerformanceTargetRateFacet is
    HoldTokenHolderFacetBase,
    CommonSustainabilityPerformanceTargetInterestRate
{
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _HOLD_TOKEN_HOLDER_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY;
    }
}
