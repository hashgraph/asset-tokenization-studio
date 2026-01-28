// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { CapFacetBase } from "../CapFacetBase.sol";
import { _CAP_RESOLVER_KEY } from "../../../layer_1/constants/resolverKeys.sol";
import { Common } from "../../../layer_0/common/Common.sol";

contract CapFacet is CapFacetBase, Common {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _CAP_RESOLVER_KEY;
    }
}
