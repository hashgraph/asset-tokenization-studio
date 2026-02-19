// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { PauseFacetBase } from "../PauseFacetBase.sol";
import { _PAUSE_FIXED_RATE_RESOLVER_KEY } from "../../../../constants/resolverKeys/features.sol";

contract PauseFixedRateFacet is PauseFacetBase {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _PAUSE_FIXED_RATE_RESOLVER_KEY;
    }
}
