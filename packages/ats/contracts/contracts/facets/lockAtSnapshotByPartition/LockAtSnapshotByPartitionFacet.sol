// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ILockAtSnapshotByPartition } from "./ILockAtSnapshotByPartition.sol";
import { LockAtSnapshotByPartition } from "./LockAtSnapshotByPartition.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _LOCK_AT_SNAPSHOT_BY_PARTITION_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title  LockAtSnapshotByPartitionFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that exposes the partition-scoped locked-balance-at-snapshot query via
 *         `ILockAtSnapshotByPartition`, registered under
 *         `_LOCK_AT_SNAPSHOT_BY_PARTITION_RESOLVER_KEY`.
 * @dev    Exposes one selector: `lockedBalanceOfAtSnapshotByPartition`. Inherits read logic from
 *         `LockAtSnapshotByPartition` and satisfies `IStaticFunctionSelectors` for Diamond proxy
 *         selector registration.
 */
contract LockAtSnapshotByPartitionFacet is LockAtSnapshotByPartition, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _LOCK_AT_SNAPSHOT_BY_PARTITION_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex = 1;
        staticFunctionSelectors_ = new bytes4[](selectorIndex);
        unchecked {
            staticFunctionSelectors_[--selectorIndex] = this.lockedBalanceOfAtSnapshotByPartition.selector;
        }
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        uint256 selectorIndex = 1;
        staticInterfaceIds_ = new bytes4[](selectorIndex);
        unchecked {
            staticInterfaceIds_[--selectorIndex] = type(ILockAtSnapshotByPartition).interfaceId;
        }
    }
}
