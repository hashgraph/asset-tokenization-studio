// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    IHoldAtSnapshotByPartition,
    RESOLVER_KEY_HOLD_AT_SNAPSHOT_BY_PARTITION
} from "./IHoldAtSnapshotByPartition.sol";
import { HoldAtSnapshotByPartition } from "./HoldAtSnapshotByPartition.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
/**
 * @title HoldAtSnapshotByPartitionFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that exposes the snapshotted partition-scoped held-balance query through
 *         the `IHoldAtSnapshotByPartition` interface, registered under
 *         `RESOLVER_KEY_HOLD_AT_SNAPSHOT_BY_PARTITION`.
 * @dev Inherits read logic from `HoldAtSnapshotByPartition` and satisfies
 *      `IStaticFunctionSelectors` for Diamond proxy selector registration. Exposes one selector:
 *      `heldBalanceOfAtSnapshotByPartition`.
 */
contract HoldAtSnapshotByPartitionFacet is HoldAtSnapshotByPartition, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_HOLD_AT_SNAPSHOT_BY_PARTITION;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return
            Bytes4Builder.build(
                this.initializeHoldAtSnapshotByPartition.selector,
                this.heldBalanceOfAtSnapshotByPartition.selector
            );
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IHoldAtSnapshotByPartition).interfaceId);
    }
}
