// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    IBalanceTrackerByPartition,
    RESOLVER_KEY_BALANCE_TRACKER_BY_PARTITION
} from "./IBalanceTrackerByPartition.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { ERC1410StorageWrapper } from "../../domain/asset/ERC1410StorageWrapper.sol";
import { ERC3643StorageWrapper } from "../../domain/core/ERC3643StorageWrapper.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";

/**
 * @title BalanceTrackerByPartition
 * @author Asset Tokenization Studio Team
 * @notice Abstract implementation of `IBalanceTrackerByPartition` that consolidates partition-scoped
 *         token balance and total supply queries into a single, time-aware read layer.
 * @dev Delegates all storage reads to `ERC1410StorageWrapper` and `ERC3643StorageWrapper`,
 *      passing the resolved timestamp from `TimeTravelStorageWrapper` to support
 *      non-triggered adjustment simulation. Intended to be inherited by `BalanceTrackerByPartitionFacet`.
 */
abstract contract BalanceTrackerByPartition is IBalanceTrackerByPartition, Modifiers {
    /// @inheritdoc IBalanceTrackerByPartition
    function initializeBalanceTrackerByPartition()
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyFacetNotRegistered(RESOLVER_KEY_BALANCE_TRACKER_BY_PARTITION)
    {
        InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_BALANCE_TRACKER_BY_PARTITION);
        emit IBalanceTrackerByPartition.BalanceTrackerByPartitionInitialized();
    }

    /// @inheritdoc IBalanceTrackerByPartition
    function balanceOfByPartition(bytes32 _partition, address _tokenHolder) external view returns (uint256) {
        return
            ERC1410StorageWrapper.balanceOfByPartitionAdjustedAt(
                _partition,
                _tokenHolder,
                TimeTravelStorageWrapper.getBlockTimestamp()
            );
    }

    /// @inheritdoc IBalanceTrackerByPartition
    function totalSupplyByPartition(bytes32 _partition) external view returns (uint256) {
        return
            ERC1410StorageWrapper.totalSupplyByPartitionAdjustedAt(
                _partition,
                TimeTravelStorageWrapper.getBlockTimestamp()
            );
    }

    /// @inheritdoc IBalanceTrackerByPartition
    function getTotalBalanceForByPartition(bytes32 _partition, address _account) external view returns (uint256) {
        return
            ERC3643StorageWrapper.getTotalBalanceForByPartitionAdjustedAt(
                _partition,
                _account,
                TimeTravelStorageWrapper.getBlockTimestamp()
            );
    }
}
