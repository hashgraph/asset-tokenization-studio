// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ProtectedPartitionsFacetBase } from "../ProtectedPartitionsFacetBase.sol";
import { _PROTECTED_PARTITIONS_FIXED_RATE_RESOLVER_KEY } from "../../../../constants/resolverKeys/features.sol";

contract ProtectedPartitionsFixedRateFacet is ProtectedPartitionsFacetBase {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _PROTECTED_PARTITIONS_FIXED_RATE_RESOLVER_KEY;
    }
}
