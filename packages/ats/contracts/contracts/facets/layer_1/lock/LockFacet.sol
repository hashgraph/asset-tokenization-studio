// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { Lock } from "./Lock.sol";
import { ILock } from "./ILock.sol";
import { IStaticFunctionSelectors } from "../../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _LOCK_RESOLVER_KEY } from "../../../constants/resolverKeys.sol";

/**
 * @title LockFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet exposing the default-partition lock surface and the all-partition
 *         read queries declared in `ILock`, registered under `_LOCK_RESOLVER_KEY`.
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
        staticResolverKey_ = _LOCK_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](8);
        staticFunctionSelectors_[selectorIndex++] = this.forceReleaseByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getLockByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.lock.selector;
        staticFunctionSelectors_[selectorIndex++] = this.release.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getLockedAmountFor.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getLockCountFor.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getLocksIdFor.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getLockFor.selector;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(ILock).interfaceId;
    }
}
