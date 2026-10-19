// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @custom:hash resolverKey CoreAtSnapshot
bytes32 constant RESOLVER_KEY_CORE_AT_SNAPSHOT = 0x9f1ab2bcf2a5668b07a2b26155b1c04f30721db434dff2f1e69a3a9b1dc0a039;

/**
 * @title ICoreAtSnapshot
 * @author Asset Tokenization Studio Team
 * @notice Interface for querying core token properties resolved against a previously taken
 *         snapshot identifier.
 * @dev Reads are delegated to `SnapshotsStorageWrapper`. Reverts with `SnapshotIdNull` for
 *      `_snapshotID == 0` and with `SnapshotIdDoesNotExists` for unknown identifiers.
 */
interface ICoreAtSnapshot {
    /**
     * @notice Emitted once when the core at snapshot capability is initialised on a token.
     * @dev Fires exclusively from `initializeCoreAtSnapshot`.
     */
    event CoreAtSnapshotInitialized();

    /**
     * @notice Initialises the core at snapshot capability on the token.
     * @dev Callable once; subsequent calls revert with `FacetAlreadyRegistered`.
     *      Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment.
     */
    function initializeCoreAtSnapshot() external;

    /**
     * @notice Returns the token decimals at the time of a given snapshot.
     * @param _snapshotID The snapshot identifier returned by a prior `takeSnapshot` call.
     * @return decimals_ The decimals value recorded at `_snapshotID`.
     */
    function decimalsAtSnapshot(uint256 _snapshotID) external view returns (uint8 decimals_);
}
