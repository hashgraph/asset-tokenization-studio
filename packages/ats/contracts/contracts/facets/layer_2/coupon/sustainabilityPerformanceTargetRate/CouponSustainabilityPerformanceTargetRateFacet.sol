// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { CouponFacetBase } from "../CouponFacetBase.sol";
// prettier-ignore
// solhint-disable-next-line max-line-length
import { _COUPON_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY } from "../../../../constants/resolverKeys.sol";

contract CouponSustainabilityPerformanceTargetRateFacet is CouponFacetBase {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _COUPON_SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY;
    }
}
