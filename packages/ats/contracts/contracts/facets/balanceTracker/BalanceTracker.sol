// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBalanceTracker } from "./IBalanceTracker.sol";
import { ERC1410StorageWrapper } from "../../domain/asset/ERC1410StorageWrapper.sol";
import { ERC3643StorageWrapper } from "../../domain/core/ERC3643StorageWrapper.sol";
import { TimeTravelStorageWrapper } from "../../test/testTimeTravel/timeTravel/TimeTravelStorageWrapper.sol";

/**
 * @title BalanceTracker
 * @notice Abstract implementation of `IBalanceTracker` that consolidates token balance and
 *         total supply queries into a single, time-aware read layer.
 * @dev Delegates all storage reads to `ERC1410StorageWrapper` and `ERC3643StorageWrapper`,
 *      passing the resolved timestamp from `TimeTravelStorageWrapper` to support
 *      non-triggered adjustment simulation. Intended to be inherited by `BalanceTrackerFacet`.
 */
abstract contract BalanceTracker is IBalanceTracker {
    /// @inheritdoc IBalanceTracker
    function balanceOf(address _tokenHolder) external view returns (uint256) {
        return ERC1410StorageWrapper.balanceOfAdjustedAt(_tokenHolder, TimeTravelStorageWrapper.getBlockTimestamp());
    }

    /// @inheritdoc IBalanceTracker
    function totalSupply() external view returns (uint256) {
        return ERC1410StorageWrapper.totalSupplyAdjustedAt(TimeTravelStorageWrapper.getBlockTimestamp());
    }

    /// @inheritdoc IBalanceTracker
    function getTotalBalanceFor(address _account) external view returns (uint256) {
        return
            ERC3643StorageWrapper.getTotalBalanceForAdjustedAt(_account, TimeTravelStorageWrapper.getBlockTimestamp());
    }
}
