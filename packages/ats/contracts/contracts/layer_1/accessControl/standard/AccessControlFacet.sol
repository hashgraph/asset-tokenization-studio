// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { AccessControlFacetBase } from "../AccessControlFacetBase.sol";
import { _ACCESS_CONTROL_RESOLVER_KEY } from "../../../layer_1/constants/resolverKeys.sol";
import { Common } from "../../../layer_0/common/Common.sol";

contract AccessControlFacet is AccessControlFacetBase, Common {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _ACCESS_CONTROL_RESOLVER_KEY;
    }
}
