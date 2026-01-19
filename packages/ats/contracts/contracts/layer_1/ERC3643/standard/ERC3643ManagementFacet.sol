// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _ERC3643_MANAGEMENT_RESOLVER_KEY } from "../../constants/resolverKeys.sol";
import { ERC3643ManagementFacetBase } from "../ERC3643ManagementFacetBase.sol";
import { Common } from "../../../layer_0/common/Common.sol";

contract ERC3643ManagementFacet is ERC3643ManagementFacetBase, Common {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _ERC3643_MANAGEMENT_RESOLVER_KEY;
    }
}
