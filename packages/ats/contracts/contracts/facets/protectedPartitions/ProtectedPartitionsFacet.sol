// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IProtectedPartitions, RESOLVER_KEY_PROTECTED_PARTITIONS } from "./IProtectedPartitions.sol";
import { ProtectedPartitions } from "./ProtectedPartitions.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";

/**
 * @title ProtectedPartitionsFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet exposing the protected-partitions toggle and partition-role query
 *         declared in `IProtectedPartitions`, registered under `RESOLVER_KEY_PROTECTED_PARTITIONS`.
 * @dev Inherits the implementation from `ProtectedPartitions` and satisfies the
 *      `IStaticFunctionSelectors` contract required by the Diamond proxy for static
 *      selector registration. Exposes 5 selectors: `initializeProtectedPartitions`,
 *      `protectPartitions`, `unprotectPartitions`, `arePartitionsProtected`,
 *      `calculateRoleForPartition`.
 */
contract ProtectedPartitionsFacet is ProtectedPartitions, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_PROTECTED_PARTITIONS;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return
            Bytes4Builder.build(
                this.initializeProtectedPartitions.selector,
                this.protectPartitions.selector,
                this.unprotectPartitions.selector,
                this.arePartitionsProtected.selector,
                this.calculateRoleForPartition.selector
            );
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IProtectedPartitions).interfaceId);
    }
}
