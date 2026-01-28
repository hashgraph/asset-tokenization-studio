// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { NoncesFacetBase } from "../NoncesFacetBase.sol";
import { _NONCES_RESOLVER_KEY } from "../../../layer_1/constants/resolverKeys.sol";
import { Common } from "../../../layer_0/common/Common.sol";

contract NoncesFacet is NoncesFacetBase, Common {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _NONCES_RESOLVER_KEY;
    }
}
