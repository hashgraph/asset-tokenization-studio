// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { Lock } from "./Lock.sol";
import { ILock, RESOLVER_KEY_LOCK } from "./ILock.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
/**
 * @title LockFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet exposing the default-partition lock surface and the all-partition
 *         read queries declared in `ILock`, registered under `RESOLVER_KEY_LOCK`.
 * @dev Inherits the implementation from `Lock` and satisfies the
 *      `IStaticFunctionSelectors` contract required by the Diamond proxy for static
 *      selector registration. Exposes 8 selectors: `lock`, `release`,
 *      `forceReleaseByPartition`, `getLockByPartition`, `getLockedAmountFor`,
 *      `getLockCountFor`, `getLocksIdFor`, `getLockFor`. The partition-aware writes and
 *      partition-scoped reads are served by `LockByPartitionFacet`.
 */
contract LockFacet is Lock, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_LOCK;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return
            Bytes4Builder.build(
                this.initializeLock.selector,
                this.forceReleaseByPartition.selector,
                this.getLockByPartition.selector,
                this.lock.selector,
                this.release.selector,
                this.getLockedAmountFor.selector,
                this.getLockCountFor.selector,
                this.getLocksIdFor.selector,
                this.getLockFor.selector,
                this.updateLockExpiration.selector
            );
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(ILock).interfaceId);
    }
}
