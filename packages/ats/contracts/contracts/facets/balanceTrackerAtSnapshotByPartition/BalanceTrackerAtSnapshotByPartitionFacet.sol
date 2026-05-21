// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBalanceTrackerAtSnapshotByPartition } from "./IBalanceTrackerAtSnapshotByPartition.sol";
import { BalanceTrackerAtSnapshotByPartition } from "./BalanceTrackerAtSnapshotByPartition.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
import { _BALANCE_TRACKER_AT_SNAPSHOT_BY_PARTITION_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title BalanceTrackerAtSnapshotByPartitionFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that exposes snapshotted partition-scoped balance and total-supply
 *         queries through the `IBalanceTrackerAtSnapshotByPartition` interface, registered under
 *         `_BALANCE_TRACKER_AT_SNAPSHOT_BY_PARTITION_RESOLVER_KEY`.
 * @dev Inherits read logic from `BalanceTrackerAtSnapshotByPartition` and satisfies
 *      `IStaticFunctionSelectors` for Diamond proxy selector registration.
 *      Exposes two selectors: `balanceOfAtSnapshotByPartition`, `totalSupplyAtSnapshotByPartition`.
 */
contract BalanceTrackerAtSnapshotByPartitionFacet is BalanceTrackerAtSnapshotByPartition, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _BALANCE_TRACKER_AT_SNAPSHOT_BY_PARTITION_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return
            Bytes4Builder.build(
                this.initializeBalanceTrackerAtSnapshotByPartition.selector,
                this.balanceOfAtSnapshotByPartition.selector,
                this.totalSupplyAtSnapshotByPartition.selector
            );
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IBalanceTrackerAtSnapshotByPartition).interfaceId);
    }
}
