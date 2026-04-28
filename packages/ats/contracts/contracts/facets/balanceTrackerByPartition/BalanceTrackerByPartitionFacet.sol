// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBalanceTrackerByPartition } from "./IBalanceTrackerByPartition.sol";
import { BalanceTrackerByPartition } from "./BalanceTrackerByPartition.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _BALANCE_TRACKER_BY_PARTITION_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title BalanceTrackerByPartitionFacet
 * @notice Diamond facet that exposes partition-scoped token balance and total supply queries
 *         through the `IBalanceTrackerByPartition` interface, registered under
 *         `_BALANCE_TRACKER_BY_PARTITION_RESOLVER_KEY`.
 * @dev Inherits balance logic from `BalanceTrackerByPartition` and satisfies the
 *      `IStaticFunctionSelectors` contract required by the Diamond proxy for selector registration.
 *      Exposes three selectors: `balanceOfByPartition`, `totalSupplyByPartition`, and
 *      `getTotalBalanceForByPartition`.
 */
contract BalanceTrackerByPartitionFacet is BalanceTrackerByPartition, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _BALANCE_TRACKER_BY_PARTITION_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex = 3;
        staticFunctionSelectors_ = new bytes4[](selectorIndex);
        unchecked {
            staticFunctionSelectors_[--selectorIndex] = this.getTotalBalanceForByPartition.selector;
            staticFunctionSelectors_[--selectorIndex] = this.totalSupplyByPartition.selector;
            staticFunctionSelectors_[--selectorIndex] = this.balanceOfByPartition.selector;
        }
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        uint256 selectorIndex = 1;
        staticInterfaceIds_ = new bytes4[](selectorIndex);
        unchecked {
            staticInterfaceIds_[--selectorIndex] = type(IBalanceTrackerByPartition).interfaceId;
        }
    }
}
