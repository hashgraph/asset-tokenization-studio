// SPDX-License-Identifier: Apache-2.0
// Contract copy-pasted form OZ and extended
pragma solidity >=0.8.0 <0.9.0;

import { ERC20FacetBase } from "../ERC20FacetBase.sol";
import { _ERC20_RESOLVER_KEY } from "../../../constants/resolverKeys.sol";
import { Common } from "../../../../layer_0/common/Common.sol";

contract ERC20Facet is ERC20FacetBase, Common {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _ERC20_RESOLVER_KEY;
    }
}
