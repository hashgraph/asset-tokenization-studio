// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { SsiManagementFacetBase } from "../SsiManagementFacetBase.sol";
import { _SSI_RESOLVER_KEY } from "../../constants/resolverKeys.sol";
import { Common } from "../../../layer_0/common/Common.sol";

contract SsiManagementFacet is SsiManagementFacetBase, Common {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _SSI_RESOLVER_KEY;
    }
}
