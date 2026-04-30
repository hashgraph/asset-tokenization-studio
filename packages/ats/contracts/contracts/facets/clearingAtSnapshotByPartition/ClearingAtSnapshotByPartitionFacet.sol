// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IClearingAtSnapshotByPartition } from "./IClearingAtSnapshotByPartition.sol";
import { ClearingAtSnapshotByPartition } from "./ClearingAtSnapshotByPartition.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _CLEARING_AT_SNAPSHOT_BY_PARTITION_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title ClearingAtSnapshotByPartitionFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that exposes the snapshotted partition-scoped cleared-balance query
 *         through the `IClearingAtSnapshotByPartition` interface, registered under
 *         `_CLEARING_AT_SNAPSHOT_BY_PARTITION_RESOLVER_KEY`.
 * @dev Inherits read logic from `ClearingAtSnapshotByPartition` and satisfies
 *      `IStaticFunctionSelectors` for Diamond proxy selector registration. Exposes one selector:
 *      `clearedBalanceOfAtSnapshotByPartition`.
 */
contract ClearingAtSnapshotByPartitionFacet is ClearingAtSnapshotByPartition, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _CLEARING_AT_SNAPSHOT_BY_PARTITION_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex = 1;
        staticFunctionSelectors_ = new bytes4[](selectorIndex);
        unchecked {
            staticFunctionSelectors_[--selectorIndex] = this.clearedBalanceOfAtSnapshotByPartition.selector;
        }
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        uint256 selectorIndex = 1;
        staticInterfaceIds_ = new bytes4[](selectorIndex);
        unchecked {
            staticInterfaceIds_[--selectorIndex] = type(IClearingAtSnapshotByPartition).interfaceId;
        }
    }
}
