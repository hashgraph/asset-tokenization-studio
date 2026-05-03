// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ICoreAtSnapshot } from "./ICoreAtSnapshot.sol";
import { SnapshotsStorageWrapper } from "../../domain/asset/SnapshotsStorageWrapper.sol";

/**
 * @title CoreAtSnapshot
 * @notice Abstract implementation of `ICoreAtSnapshot` providing snapshotted core token property
 *         queries indexed by a snapshot identifier.
 * @dev Delegates storage reads to `SnapshotsStorageWrapper`. Intended to be inherited by
 *      `CoreAtSnapshotFacet`.
 * @author Asset Tokenization Studio Team
 */
abstract contract CoreAtSnapshot is ICoreAtSnapshot {
    /// @inheritdoc ICoreAtSnapshot
    function decimalsAtSnapshot(uint256 _snapshotID) external view override returns (uint8 decimals_) {
        decimals_ = SnapshotsStorageWrapper.decimalsAtSnapshot(_snapshotID);
    }
}
