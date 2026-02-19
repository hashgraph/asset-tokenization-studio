// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { HoldManagementFacetBase } from "../HoldManagementFacetBase.sol";
import { _HOLD_RESOLVER_KEY } from "../../../../constants/resolverKeys/features.sol";

contract HoldManagementFacet is HoldManagementFacetBase {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _HOLD_RESOLVER_KEY;
    }
}
