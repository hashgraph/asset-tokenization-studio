// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBalanceTrackerAtSnapshot, RESOLVER_KEY_BALANCE_TRACKER_AT_SNAPSHOT } from "./IBalanceTrackerAtSnapshot.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { HolderBalance } from "../snapshots/ISnapshots.sol";
import { SnapshotsStorageWrapper } from "../../domain/asset/SnapshotsStorageWrapper.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";

/**
 * @title BalanceTrackerAtSnapshot
 * @author Asset Tokenization Studio Team
 * @notice Abstract implementation of `IBalanceTrackerAtSnapshot` providing snapshotted balance
 *         and total-supply queries indexed by a snapshot identifier.
 * @dev Delegates storage reads to `SnapshotsStorageWrapper`. Intended to be inherited by
 *      `BalanceTrackerAtSnapshotFacet`.
 */
abstract contract BalanceTrackerAtSnapshot is IBalanceTrackerAtSnapshot, Modifiers {
    /// @inheritdoc IBalanceTrackerAtSnapshot
    function initializeBalanceTrackerAtSnapshot()
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyFacetNotRegistered(RESOLVER_KEY_BALANCE_TRACKER_AT_SNAPSHOT)
    {
        InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_BALANCE_TRACKER_AT_SNAPSHOT);
        emit IBalanceTrackerAtSnapshot.BalanceTrackerAtSnapshotInitialized();
    }

    /// @inheritdoc IBalanceTrackerAtSnapshot
    function balanceOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) external view override returns (uint256 balance_) {
        balance_ = SnapshotsStorageWrapper.balanceOfAtSnapshot(_snapshotID, _tokenHolder);
    }

    /// @inheritdoc IBalanceTrackerAtSnapshot
    function balancesOfAtSnapshot(
        uint256 _snapshotID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (HolderBalance[] memory balances_) {
        balances_ = SnapshotsStorageWrapper.balancesOfAtSnapshot(_snapshotID, _pageIndex, _pageLength);
    }

    /// @inheritdoc IBalanceTrackerAtSnapshot
    function totalSupplyAtSnapshot(uint256 _snapshotID) external view override returns (uint256 totalSupply_) {
        totalSupply_ = SnapshotsStorageWrapper.totalSupplyAtSnapshot(_snapshotID);
    }
}
