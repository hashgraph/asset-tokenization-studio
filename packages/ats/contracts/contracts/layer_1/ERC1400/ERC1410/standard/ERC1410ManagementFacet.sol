// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ERC1410ManagementFacetBase } from "../ERC1410ManagementFacetBase.sol";
import { _ERC1410_MANAGEMENT_RESOLVER_KEY } from "../../../../layer_1/constants/resolverKeys.sol";
import { Common } from "../../../../layer_0/common/Common.sol";

contract ERC1410ManagementFacet is ERC1410ManagementFacetBase, Common {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _ERC1410_MANAGEMENT_RESOLVER_KEY;
    }
}
