// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title  ISecurityHoldersAtSnapshot
 * @notice Interface for querying the set of token holders captured at a specific snapshot.
 * @dev    Both functions delegate reads to `SnapshotsStorageWrapper`. Lazy resolution
 *         applies: if no snapshot entry exists for a holder at the requested identifier, the
 *         wrapper falls back to the live ERC-1410 holder registry.
 *         Reverts with `SnapshotIdNull` when `_snapshotID == 0` and with
 *         `SnapshotIdDoesNotExists` for unknown identifiers.
 * @author Asset Tokenization Studio Team
 */
interface ISecurityHoldersAtSnapshot {
    /**
     * @notice Returns a paginated list of token holders recorded at the time of a given
     *         snapshot.
     * @dev    Pagination is zero-indexed. An empty page (when `_pageIndex` is beyond the
     *         total holder count) returns an empty array without reverting.
     *         Reverts with `SnapshotIdNull` when `_snapshotID == 0`.
     *         Reverts with `SnapshotIdDoesNotExists` when `_snapshotID` has never been taken.
     * @param  _snapshotID  The snapshot identifier returned by a prior `takeSnapshot` call.
     * @param  _pageIndex   Zero-based page number.
     * @param  _pageLength  Maximum number of addresses to return per page.
     * @return holders_     Addresses of token holders recorded at `_snapshotID` for the
     *                      requested page.
     */
    function getTokenHoldersAtSnapshot(
        uint256 _snapshotID,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (address[] memory holders_);

    /**
     * @notice Returns the total number of token holders recorded at the time of a given
     *         snapshot.
     * @dev    Reverts with `SnapshotIdNull` when `_snapshotID == 0`.
     *         Reverts with `SnapshotIdDoesNotExists` when `_snapshotID` has never been taken.
     * @param  _snapshotID The snapshot identifier returned by a prior `takeSnapshot` call.
     * @return             Total number of distinct token holders at `_snapshotID`.
     */
    function getTotalTokenHoldersAtSnapshot(uint256 _snapshotID) external view returns (uint256);
}
