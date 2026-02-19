// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ClearingActionsFacetBase } from "../ClearingActionsFacetBase.sol";
import { _CLEARING_ACTIONS_FIXED_RATE_RESOLVER_KEY } from "../../../../constants/resolverKeys/features.sol";

contract ClearingActionsFixedRateFacet is ClearingActionsFacetBase {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _CLEARING_ACTIONS_FIXED_RATE_RESOLVER_KEY;
    }
}
