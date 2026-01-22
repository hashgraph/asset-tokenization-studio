// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ExternalPauseManagementFacetBase } from "../ExternalPauseManagementFacetBase.sol";
import {
    _EXTERNAL_PAUSE_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY
} from "contracts/layer_1/constants/resolverKeys.sol";
import {
    CommonSustainabilityPerformanceTargetInterestRate
// solhint-disable-next-line max-line-length
} from "contracts/layer_0_extensions/bond/fixingDateInterestRate/kpiInterestRate/sustainabilityPerformanceTargetInterestRate/Common.sol";

contract ExternalPauseManagementSustainabilityPerformanceTargetRateFacet is
    ExternalPauseManagementFacetBase,
    CommonSustainabilityPerformanceTargetInterestRate
{
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _EXTERNAL_PAUSE_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY;
    }
}
