// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { CapFacetBase } from "../CapFacetBase.sol";
import { _CAP_FIXED_RATE_RESOLVER_KEY } from "../../../../constants/resolverKeys/features.sol";

contract CapFixedRateFacet is CapFacetBase {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _CAP_FIXED_RATE_RESOLVER_KEY;
    }
}
