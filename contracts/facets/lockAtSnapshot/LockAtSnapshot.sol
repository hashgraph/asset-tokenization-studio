// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ILockAtSnapshot, RESOLVER_KEY_LOCK_AT_SNAPSHOT } from "./ILockAtSnapshot.sol";
import { SnapshotsStorageWrapper } from "../../domain/asset/SnapshotsStorageWrapper.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";

/**
 * @title  LockAtSnapshot
 * @notice Abstract implementation of `ILockAtSnapshot`.
 * @dev    Delegates all storage reads to `SnapshotsStorageWrapper`. Intended to be
 *         inherited solely by `LockAtSnapshotFacet`.
 * @author Asset Tokenization Studio Team
 */
abstract contract LockAtSnapshot is ILockAtSnapshot, Modifiers {
    /// @inheritdoc ILockAtSnapshot
    function initializeLockAtSnapshot()
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyFacetNotRegistered(RESOLVER_KEY_LOCK_AT_SNAPSHOT)
    {
        InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_LOCK_AT_SNAPSHOT);
        emit LockAtSnapshotInitialized();
    }

    /// @inheritdoc ILockAtSnapshot
    function lockedBalanceOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) external view override returns (uint256 balance_) {
        balance_ = SnapshotsStorageWrapper.lockedBalanceOfAtSnapshot(_snapshotID, _tokenHolder);
    }
}
