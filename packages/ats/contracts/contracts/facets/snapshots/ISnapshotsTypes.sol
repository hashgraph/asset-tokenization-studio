// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @title ISnapshotsTypes
/// @author Asset Tokenization Studio Team
/// @notice Shared error types for snapshot-domain facets.
/// @dev Imported by both ISnapshots and ISnapshotsByPartition so the error selectors
///      remain canonical and are never redeclared across interfaces.
interface ISnapshotsTypes {
    /// @notice Thrown when a snapshot identifier of zero is supplied; zero is reserved and never
    ///         assigned to a valid snapshot.
    error SnapshotIdNull();

    /// @notice Thrown when the requested snapshot identifier has never been taken on this token.
    /// @param snapshotId The unrecognised snapshot identifier that was supplied.
    error SnapshotIdDoesNotExists(uint256 snapshotId);
}
