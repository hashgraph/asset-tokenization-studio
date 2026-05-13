// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IHoldByPartition } from "./IHoldByPartition.sol";
import { HoldByPartition } from "./HoldByPartition.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
import { _HOLD_BY_PARTITION_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title HoldByPartitionFacet
 * @notice Diamond facet that exposes all hold operations scoped to a specific partition
 *         through the `IHoldByPartition` interface, registered under `_HOLD_BY_PARTITION_RESOLVER_KEY`.
 * @dev Inherits hold logic from `HoldByPartition` and satisfies the `IStaticFunctionSelectors`
 *      contract required by the Diamond proxy for selector registration. Exposes nine selectors:
 *      five write operations (createHoldByPartition, createHoldFromByPartition, executeHoldByPartition,
 *      releaseHoldByPartition, reclaimHoldByPartition) and four partition-scoped read operations
 *      (getHeldAmountForByPartition, getHoldCountForByPartition, getHoldsIdForByPartition,
 *      getHoldForByPartition).
 * @author Asset Tokenization Studio Team
 */
contract HoldByPartitionFacet is HoldByPartition, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _HOLD_BY_PARTITION_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return
            Bytes4Builder.build(
                this.createHoldByPartition.selector,
                this.createHoldFromByPartition.selector,
                this.executeHoldByPartition.selector,
                this.releaseHoldByPartition.selector,
                this.reclaimHoldByPartition.selector,
                this.getHeldAmountForByPartition.selector,
                this.getHoldCountForByPartition.selector,
                this.getHoldsIdForByPartition.selector,
                this.getHoldForByPartition.selector
            );
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IHoldByPartition).interfaceId);
    }
}
