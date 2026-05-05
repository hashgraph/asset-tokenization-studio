// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IFreezeAtSnapshotByPartition } from "./IFreezeAtSnapshotByPartition.sol";
import { FreezeAtSnapshotByPartition } from "./FreezeAtSnapshotByPartition.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _FREEZE_AT_SNAPSHOT_BY_PARTITION_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title FreezeAtSnapshotByPartitionFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet exposing partition-aware snapshot frozen balance queries via
 *         `IFreezeAtSnapshotByPartition`, registered under
 *         `_FREEZE_AT_SNAPSHOT_BY_PARTITION_RESOLVER_KEY`.
 * @dev Consolidates `frozenBalanceOfAtSnapshotByPartition` previously hosted in
 *      `SnapshotsFacet`. Exposes 1 selector: `frozenBalanceOfAtSnapshotByPartition`.
 */
contract FreezeAtSnapshotByPartitionFacet is FreezeAtSnapshotByPartition, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _FREEZE_AT_SNAPSHOT_BY_PARTITION_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex = 1;
        staticFunctionSelectors_ = new bytes4[](selectorIndex);
        unchecked {
            staticFunctionSelectors_[--selectorIndex] = this.frozenBalanceOfAtSnapshotByPartition.selector;
        }
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        uint256 selectorIndex = 1;
        staticInterfaceIds_ = new bytes4[](selectorIndex);
        unchecked {
            staticInterfaceIds_[--selectorIndex] = type(IFreezeAtSnapshotByPartition).interfaceId;
        }
    }
}
