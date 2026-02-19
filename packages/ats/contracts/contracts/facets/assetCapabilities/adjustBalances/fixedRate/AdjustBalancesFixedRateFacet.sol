// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { AdjustBalancesFacetBase } from "../AdjustBalancesFacetBase.sol";
import { _BALANCE_ADJUSTMENTS_FIXED_RATE_RESOLVER_KEY } from "../../../../constants/resolverKeys/assets.sol";

contract AdjustBalancesFixedRateFacet is AdjustBalancesFacetBase {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _BALANCE_ADJUSTMENTS_FIXED_RATE_RESOLVER_KEY;
    }
}
