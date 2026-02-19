// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ERC1410ReadFacetBase } from "../ERC1410ReadFacetBase.sol";
import { _ERC1410_READ_RESOLVER_KEY } from "../../../../../constants/resolverKeys/features.sol";

contract ERC1410ReadFacet is ERC1410ReadFacetBase {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _ERC1410_READ_RESOLVER_KEY;
    }
}
