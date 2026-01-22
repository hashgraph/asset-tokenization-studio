// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { AccessControlFacetBase } from "../AccessControlFacetBase.sol";
import {
    _ACCESS_CONTROL_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY
} from "contracts/layer_1/constants/resolverKeys.sol";
// prettier-ignore
// solhint-disable-next-line max-line-length
import { CommonSustainabilityPerformanceTargetInterestRate } from "contracts/layer_0_extensions/bond/fixingDateInterestRate/kpiInterestRate/sustainabilityPerformanceTargetInterestRate/Common.sol";

contract AccessControlSustainabilityPerformanceTargetRateFacet is
    AccessControlFacetBase,
    CommonSustainabilityPerformanceTargetInterestRate
{
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _ACCESS_CONTROL_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY;
    }
}
