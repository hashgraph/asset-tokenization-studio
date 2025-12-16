// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _ERC3643_BATCH_RESOLVER_KEY } from "../../constants/resolverKeys.sol";
import { ERC3643BatchFacetBase } from "../ERC3643BatchFacetBase.sol";
import { Common } from "../../../layer_0/common/Common.sol";

contract ERC3643BatchFacet is ERC3643BatchFacetBase, Common {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _ERC3643_BATCH_RESOLVER_KEY;
    }
}
