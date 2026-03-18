// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    _TRANSFER_AND_LOCK_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY
} from "../../../../constants/resolverKeys.sol";
import { TransferAndLockFacetBase } from "../TransferAndLockFacetBase.sol";
// prettier-ignore
/* solhint-disable max-line-length */
import { CommonSustainabilityPerformanceTargetInterestRate } from "../../../../domain/asset/extension/bond/fixingDateInterestRate/kpiInterestRate/sustainabilityPerformanceTargetInterestRate/Common.sol";
/* solhint-enable max-line-length */

contract TransferAndLockSustainabilityPerformanceTargetRateFacet is
    TransferAndLockFacetBase,
    CommonSustainabilityPerformanceTargetInterestRate
{
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _TRANSFER_AND_LOCK_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY;
    }
}
