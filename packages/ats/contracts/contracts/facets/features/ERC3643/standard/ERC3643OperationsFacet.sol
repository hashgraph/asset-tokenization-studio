// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _ERC3643_OPERATIONS_RESOLVER_KEY } from "../../../../constants/resolverKeys/features.sol";
import { ERC3643OperationsFacetBase } from "../ERC3643OperationsFacetBase.sol";

contract ERC3643OperationsFacet is ERC3643OperationsFacetBase {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _ERC3643_OPERATIONS_RESOLVER_KEY;
    }
}
