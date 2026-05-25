// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    IBalanceTrackerByPartition,
    RESOLVER_KEY_BALANCE_TRACKER_BY_PARTITION
} from "./IBalanceTrackerByPartition.sol";
import { BalanceTrackerByPartition } from "./BalanceTrackerByPartition.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
/**
 * @title BalanceTrackerByPartitionFacet
 * @notice Diamond facet that exposes partition-scoped token balance and total supply queries
 *         through the `IBalanceTrackerByPartition` interface, registered under
 *         `RESOLVER_KEY_BALANCE_TRACKER_BY_PARTITION`.
 * @dev Inherits balance logic from `BalanceTrackerByPartition` and satisfies the
 *      `IStaticFunctionSelectors` contract required by the Diamond proxy for selector registration.
 *      Exposes three selectors: `balanceOfByPartition`, `totalSupplyByPartition`, and
 *      `getTotalBalanceForByPartition`.
 */
contract BalanceTrackerByPartitionFacet is BalanceTrackerByPartition, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_BALANCE_TRACKER_BY_PARTITION;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return
            Bytes4Builder.build(
                this.balanceOfByPartition.selector,
                this.totalSupplyByPartition.selector,
                this.getTotalBalanceForByPartition.selector
            );
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IBalanceTrackerByPartition).interfaceId);
    }
}
