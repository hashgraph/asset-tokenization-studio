// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ICapByPartition, RESOLVER_KEY_CAP_BY_PARTITION } from "./ICapByPartition.sol";
import { CapByPartition } from "./CapByPartition.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
/**
 * @title CapByPartitionFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that exposes the per-partition maximum supply cap surface through the
 *         `ICapByPartition` interface, registered under `RESOLVER_KEY_CAP_BY_PARTITION`.
 * @dev Inherits behaviour from `CapByPartition` and satisfies `IStaticFunctionSelectors` for
 *      Diamond proxy selector registration. Exposes three selectors:
 *      `initializeCapByPartition`, `setMaxSupplyByPartition`, `getMaxSupplyByPartition`.
 */
contract CapByPartitionFacet is CapByPartition, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_CAP_BY_PARTITION;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return
            Bytes4Builder.build(
                this.initializeCapByPartition.selector,
                this.setMaxSupplyByPartition.selector,
                this.getMaxSupplyByPartition.selector
            );
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(ICapByPartition).interfaceId);
    }
}
