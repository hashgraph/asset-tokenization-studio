// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ERC1410IssuerFacetBase } from "../ERC1410IssuerFacetBase.sol";
import { _ERC1410_ISSUER_RESOLVER_KEY } from "../../../../layer_1/constants/resolverKeys.sol";
import { Common } from "../../../../layer_0/common/Common.sol";

contract ERC1410IssuerFacet is ERC1410IssuerFacetBase, Common {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _ERC1410_ISSUER_RESOLVER_KEY;
    }
}
