// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IProtectedPartitions, RESOLVER_KEY_PROTECTED_PARTITIONS } from "./IProtectedPartitions.sol";
import { ProtectedPartitions } from "./ProtectedPartitions.sol";
import { IStaticFunctionSelectors } from "../../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../../infrastructure/proxy/Bytes4Builder.sol";
contract ProtectedPartitionsFacet is ProtectedPartitions, IStaticFunctionSelectors {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_PROTECTED_PARTITIONS;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return
            Bytes4Builder.build(
                this.initialize_ProtectedPartitions.selector,
                this.protectPartitions.selector,
                this.unprotectPartitions.selector,
                this.arePartitionsProtected.selector,
                this.calculateRoleForPartition.selector
            );
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IProtectedPartitions).interfaceId);
    }
}
