// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IHoldAtSnapshotByPartition } from "./IHoldAtSnapshotByPartition.sol";
import { HoldAtSnapshotByPartition } from "./HoldAtSnapshotByPartition.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _HOLD_AT_SNAPSHOT_BY_PARTITION_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title HoldAtSnapshotByPartitionFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that exposes the snapshotted partition-scoped held-balance query through
 *         the `IHoldAtSnapshotByPartition` interface, registered under
 *         `_HOLD_AT_SNAPSHOT_BY_PARTITION_RESOLVER_KEY`.
 * @dev Inherits read logic from `HoldAtSnapshotByPartition` and satisfies
 *      `IStaticFunctionSelectors` for Diamond proxy selector registration. Exposes one selector:
 *      `heldBalanceOfAtSnapshotByPartition`.
 */
contract HoldAtSnapshotByPartitionFacet is HoldAtSnapshotByPartition, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _HOLD_AT_SNAPSHOT_BY_PARTITION_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex = 1;
        staticFunctionSelectors_ = new bytes4[](selectorIndex);
        unchecked {
            staticFunctionSelectors_[--selectorIndex] = this.heldBalanceOfAtSnapshotByPartition.selector;
        }
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        uint256 selectorIndex = 1;
        staticInterfaceIds_ = new bytes4[](selectorIndex);
        unchecked {
            staticInterfaceIds_[--selectorIndex] = type(IHoldAtSnapshotByPartition).interfaceId;
        }
    }
}
