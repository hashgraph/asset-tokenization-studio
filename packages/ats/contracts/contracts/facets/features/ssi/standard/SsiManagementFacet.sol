// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { SsiManagementFacetBase } from "../SsiManagementFacetBase.sol";
import { _SSI_RESOLVER_KEY } from "../../../../constants/resolverKeys/features.sol";

contract SsiManagementFacet is SsiManagementFacetBase {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _SSI_RESOLVER_KEY;
    }
}
