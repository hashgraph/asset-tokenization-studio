// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ERC1644FacetBase } from "../ERC1644FacetBase.sol";
import { _ERC1644_RESOLVER_KEY } from "../../../../../constants/resolverKeys/features.sol";

contract ERC1644Facet is ERC1644FacetBase {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _ERC1644_RESOLVER_KEY;
    }
}
