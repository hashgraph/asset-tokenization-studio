// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _ERC3643_READ_RESOLVER_KEY } from "../../constants/resolverKeys.sol";
import { ERC3643ReadFacetBase } from "../ERC3643ReadFacetBase.sol";
import { Common } from "../../../layer_0/common/Common.sol";

contract ERC3643ReadFacet is ERC3643ReadFacetBase, Common {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _ERC3643_READ_RESOLVER_KEY;
    }
}
