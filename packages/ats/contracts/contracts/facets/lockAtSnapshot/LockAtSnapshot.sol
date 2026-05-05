// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ILockAtSnapshot } from "./ILockAtSnapshot.sol";
import { SnapshotsStorageWrapper } from "../../domain/asset/SnapshotsStorageWrapper.sol";

/**
 * @title  LockAtSnapshot
 * @notice Abstract implementation of `ILockAtSnapshot`.
 * @dev    Delegates all storage reads to `SnapshotsStorageWrapper`. Intended to be
 *         inherited solely by `LockAtSnapshotFacet`.
 * @author Asset Tokenization Studio Team
 */
abstract contract LockAtSnapshot is ILockAtSnapshot {
    /// @inheritdoc ILockAtSnapshot
    function lockedBalanceOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) external view override returns (uint256 balance_) {
        balance_ = SnapshotsStorageWrapper.lockedBalanceOfAtSnapshot(_snapshotID, _tokenHolder);
    }
}
