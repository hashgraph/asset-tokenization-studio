// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ERC1643FacetBase } from "../ERC1643FacetBase.sol";
import { _ERC1643_RESOLVER_KEY } from "../../../../../constants/resolverKeys/features.sol";

contract ERC1643Facet is ERC1643FacetBase {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _ERC1643_RESOLVER_KEY;
    }
}
