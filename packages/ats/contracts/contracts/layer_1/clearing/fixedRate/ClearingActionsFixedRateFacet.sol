// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ClearingActionsFacetBase } from "../ClearingActionsFacetBase.sol";
import { _CLEARING_FIXED_RATE_RESOLVER_KEY } from "contracts/layer_1/constants/resolverKeys.sol";
import { CommonFixedInterestRate } from "contracts/layer_0_extensions/bond/fixedInterestRate/Common.sol";

contract ClearingActionsFixedRateFacet is ClearingActionsFacetBase, CommonFixedInterestRate {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _CLEARING_FIXED_RATE_RESOLVER_KEY;
    }
}
