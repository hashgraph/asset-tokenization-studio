// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    IClearingAtSnapshotByPartition,
    RESOLVER_KEY_CLEARING_AT_SNAPSHOT_BY_PARTITION
} from "./IClearingAtSnapshotByPartition.sol";
import { ClearingAtSnapshotByPartition } from "./ClearingAtSnapshotByPartition.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
/**
 * @title ClearingAtSnapshotByPartitionFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that exposes the snapshotted partition-scoped cleared-balance query
 *         through the `IClearingAtSnapshotByPartition` interface, registered under
 *         `RESOLVER_KEY_CLEARING_AT_SNAPSHOT_BY_PARTITION`.
 * @dev Inherits read logic from `ClearingAtSnapshotByPartition` and satisfies
 *      `IStaticFunctionSelectors` for Diamond proxy selector registration. Exposes one selector:
 *      `clearedBalanceOfAtSnapshotByPartition`.
 */
contract ClearingAtSnapshotByPartitionFacet is ClearingAtSnapshotByPartition, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_CLEARING_AT_SNAPSHOT_BY_PARTITION;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(this.clearedBalanceOfAtSnapshotByPartition.selector);
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IClearingAtSnapshotByPartition).interfaceId);
    }
}
