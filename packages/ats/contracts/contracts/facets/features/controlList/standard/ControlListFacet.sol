// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ControlListFacetBase } from "../ControlListFacetBase.sol";
import { _CONTROL_LIST_RESOLVER_KEY } from "../../../../constants/resolverKeys/features.sol";

contract ControlListFacet is ControlListFacetBase {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _CONTROL_LIST_RESOLVER_KEY;
    }
}
