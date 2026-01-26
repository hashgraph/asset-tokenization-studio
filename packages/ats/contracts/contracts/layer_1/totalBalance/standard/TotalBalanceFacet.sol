// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { TotalBalanceFacetBase } from "../TotalBalanceFacetBase.sol";
import { _TOTAL_BALANCE_RESOLVER_KEY } from "contracts/layer_1/constants/resolverKeys.sol";
import { Common } from "contracts/layer_0/common/Common.sol";

contract TotalBalanceFacet is TotalBalanceFacetBase, Common {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _TOTAL_BALANCE_RESOLVER_KEY;
    }
}
