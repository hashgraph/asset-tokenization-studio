// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { NoncesFacetBase } from "../NoncesFacetBase.sol";
import { _NONCES_FIXED_RATE_RESOLVER_KEY } from "../../../../constants/resolverKeys/features.sol";

contract NoncesFixedRateFacet is NoncesFacetBase {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _NONCES_FIXED_RATE_RESOLVER_KEY;
    }
}
