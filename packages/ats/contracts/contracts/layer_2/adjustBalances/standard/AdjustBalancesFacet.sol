// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { AdjustBalancesFacetBase } from "../AdjustBalancesFacetBase.sol";
import { _BALANCE_ADJUSTMENTS_RESOLVER_KEY } from "contracts/layer_2/constants/resolverKeys.sol";
import { Common } from "contracts/layer_0/common/Common.sol";

contract AdjustBalancesFacet is AdjustBalancesFacetBase, Common {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _BALANCE_ADJUSTMENTS_RESOLVER_KEY;
    }
}
