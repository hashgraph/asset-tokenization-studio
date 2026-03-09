// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ClearingRedeemFacetBase } from "../ClearingRedeemFacetBase.sol";
import { _CLEARING_REDEEM_FIXED_RATE_RESOLVER_KEY } from "../../constants/resolverKeys.sol";
import { CommonFixedInterestRate } from "../../../layer_0_extensions/bond/fixedInterestRate/Common.sol";

contract ClearingRedeemFixedRateFacet is ClearingRedeemFacetBase, CommonFixedInterestRate {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _CLEARING_REDEEM_FIXED_RATE_RESOLVER_KEY;
    }
}
