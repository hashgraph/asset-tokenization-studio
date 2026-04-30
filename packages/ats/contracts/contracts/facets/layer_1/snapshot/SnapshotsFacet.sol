// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ISnapshots } from "./ISnapshots.sol";
import { Snapshots } from "./Snapshots.sol";
import { IStaticFunctionSelectors } from "../../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _SNAPSHOTS_RESOLVER_KEY } from "../../../constants/resolverKeys.sol";

/**
 * @title SnapshotsFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that exposes snapshot creation, scheduling, and historical balance,
 *         supply, and partition queries through the `ISnapshots` interface.
 * @dev Inherits behaviour from `Snapshots` and satisfies `IStaticFunctionSelectors` for
 *      registration in the Diamond proxy under `_SNAPSHOTS_RESOLVER_KEY`. Selectors are
 *      written into a fixed-size array using pre-decrement indexing inside an `unchecked`
 *      block; the declared `selectorIndex` initial value must match the array length.
 */
contract SnapshotsFacet is Snapshots, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _SNAPSHOTS_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex = 13;
        staticFunctionSelectors_ = new bytes4[](selectorIndex);
        unchecked {
            staticFunctionSelectors_[--selectorIndex] = this.getTotalTokenHoldersAtSnapshot.selector;
            staticFunctionSelectors_[--selectorIndex] = this.getTokenHoldersAtSnapshot.selector;
            staticFunctionSelectors_[--selectorIndex] = this.frozenBalanceOfAtSnapshotByPartition.selector;
            staticFunctionSelectors_[--selectorIndex] = this.frozenBalanceOfAtSnapshot.selector;
            staticFunctionSelectors_[--selectorIndex] = this.clearedBalanceOfAtSnapshot.selector;
            staticFunctionSelectors_[--selectorIndex] = this.heldBalanceOfAtSnapshotByPartition.selector;
            staticFunctionSelectors_[--selectorIndex] = this.heldBalanceOfAtSnapshot.selector;
            staticFunctionSelectors_[--selectorIndex] = this.lockedBalanceOfAtSnapshotByPartition.selector;
            staticFunctionSelectors_[--selectorIndex] = this.lockedBalanceOfAtSnapshot.selector;
            staticFunctionSelectors_[--selectorIndex] = this.partitionsOfAtSnapshot.selector;
            staticFunctionSelectors_[--selectorIndex] = this.takeSnapshot.selector;
            staticFunctionSelectors_[--selectorIndex] = this.getScheduledSnapshots.selector;
            staticFunctionSelectors_[--selectorIndex] = this.scheduledSnapshotCount.selector;
        }
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        uint256 selectorIndex = 1;
        staticInterfaceIds_ = new bytes4[](selectorIndex);
        unchecked {
            staticInterfaceIds_[--selectorIndex] = type(ISnapshots).interfaceId;
        }
    }
}
