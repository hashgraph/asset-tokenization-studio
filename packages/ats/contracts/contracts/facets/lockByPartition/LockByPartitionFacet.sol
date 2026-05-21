// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ILockByPartition } from "./ILockByPartition.sol";
import { LockByPartition } from "./LockByPartition.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
import { _LOCK_BY_PARTITION_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title LockByPartitionFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet exposing partition-aware lock operations and partition-scoped read
 *         queries via `ILockByPartition`, registered under `_LOCK_BY_PARTITION_RESOLVER_KEY`.
 * @dev Inherits the implementation from `LockByPartition` and satisfies the
 *      `IStaticFunctionSelectors` contract required by the Diamond proxy for static
 *      selector registration. Exposes 6 selectors: `lockByPartition`, `releaseByPartition`,
 *      `getLockedAmountForByPartition`, `getLockCountForByPartition`,
 *      `getLocksIdForByPartition`, `getLockForByPartition`.
 */
contract LockByPartitionFacet is LockByPartition, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _LOCK_BY_PARTITION_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return
            Bytes4Builder.build(
                this.initializeLockByPartition.selector,
                this.lockByPartition.selector,
                this.releaseByPartition.selector,
                this.getLockedAmountForByPartition.selector,
                this.getLockCountForByPartition.selector,
                this.getLocksIdForByPartition.selector,
                this.getLockForByPartition.selector
            );
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(ILockByPartition).interfaceId);
    }
}
