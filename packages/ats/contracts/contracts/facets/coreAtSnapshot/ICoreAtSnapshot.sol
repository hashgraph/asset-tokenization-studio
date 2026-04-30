// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title ICoreAtSnapshot
 * @notice Interface for querying core token properties resolved against a previously taken
 *         snapshot identifier.
 * @dev Reads are delegated to `SnapshotsStorageWrapper`. Reverts with `SnapshotIdNull` for
 *      `_snapshotID == 0` and with `SnapshotIdDoesNotExists` for unknown identifiers.
 */
interface ICoreAtSnapshot {
    /**
     * @notice Returns the token decimals at the time of a given snapshot.
     * @param _snapshotID The snapshot identifier returned by a prior `takeSnapshot` call.
     * @return decimals_ The decimals value recorded at `_snapshotID`.
     */
    function decimalsAtSnapshot(uint256 _snapshotID) external view returns (uint8 decimals_);
}
