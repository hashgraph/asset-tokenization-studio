// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IClearingAtSnapshot } from "./IClearingAtSnapshot.sol";
import { SnapshotsStorageWrapper } from "../../domain/asset/SnapshotsStorageWrapper.sol";

/**
 * @title ClearingAtSnapshot
 * @author Asset Tokenization Studio Team
 * @notice Abstract implementation of `IClearingAtSnapshot` providing the snapshotted aggregate
 *         cleared-balance query indexed by a snapshot identifier.
 * @dev Delegates storage reads to `SnapshotsStorageWrapper`. Intended to be inherited by
 *      `ClearingAtSnapshotFacet`.
 */
abstract contract ClearingAtSnapshot is IClearingAtSnapshot {
    /// @inheritdoc IClearingAtSnapshot
    function clearedBalanceOfAtSnapshot(
        uint256 _snapshotID,
        address _tokenHolder
    ) external view override returns (uint256 balance_) {
        balance_ = SnapshotsStorageWrapper.clearedBalanceOfAtSnapshot(_snapshotID, _tokenHolder);
    }
}
