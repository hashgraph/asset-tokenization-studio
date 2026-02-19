// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ERC1410TokenHolderFacetBase } from "../ERC1410TokenHolderFacetBase.sol";
import { _ERC1410_TOKEN_HOLDER_FIXED_RATE_RESOLVER_KEY } from "../../../../../constants/resolverKeys/features.sol";

contract ERC1410TokenHolderFixedRateFacet is ERC1410TokenHolderFacetBase {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _ERC1410_TOKEN_HOLDER_FIXED_RATE_RESOLVER_KEY;
    }
}
