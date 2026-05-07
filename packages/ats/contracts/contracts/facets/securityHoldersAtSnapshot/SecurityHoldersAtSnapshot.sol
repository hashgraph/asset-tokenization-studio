// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ISecurityHoldersAtSnapshot } from "./ISecurityHoldersAtSnapshot.sol";
import { SnapshotsStorageWrapper } from "../../domain/asset/SnapshotsStorageWrapper.sol";

/**
 * @title  SecurityHoldersAtSnapshot
 * @notice Abstract implementation of `ISecurityHoldersAtSnapshot`.
 * @dev    Delegates all storage reads to `SnapshotsStorageWrapper`. Intended to be
 *         inherited solely by `SecurityHoldersAtSnapshotFacet`.
 * @author Asset Tokenization Studio Team
 */
abstract contract SecurityHoldersAtSnapshot is ISecurityHoldersAtSnapshot {
    /// @inheritdoc ISecurityHoldersAtSnapshot
    function getTokenHoldersAtSnapshot(
        uint256 _snapshotID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (address[] memory holders_) {
        return SnapshotsStorageWrapper.tokenHoldersAt(_snapshotID, _pageIndex, _pageLength);
    }

    /// @inheritdoc ISecurityHoldersAtSnapshot
    function getTotalTokenHoldersAtSnapshot(uint256 _snapshotID) external view override returns (uint256) {
        return SnapshotsStorageWrapper.totalTokenHoldersAt(_snapshotID);
    }
}
