// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @title ISnapshotsTypes
/// @author Asset Tokenization Studio Team
/// @notice Shared error types for snapshot-domain facets.
/// @dev Imported by both ISnapshots and ISnapshotsByPartition so the error selectors
///      remain canonical and are never redeclared across interfaces.
interface ISnapshotsTypes {
    error SnapshotIdNull();
    error SnapshotIdDoesNotExists(uint256 snapshotId);
}
