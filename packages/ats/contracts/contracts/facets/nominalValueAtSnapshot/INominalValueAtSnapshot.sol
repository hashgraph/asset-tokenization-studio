// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @custom:hash resolverKey NominalValueAtSnapshot
// solhint-disable-next-line max-line-length
bytes32 constant RESOLVER_KEY_NOMINAL_VALUE_AT_SNAPSHOT = 0xca313777aee568dc14b1700e7be675b73932bbbc4e4f974a9f1321e6d653af74;

/**
 * @title  INominalValueAtSnapshot
 * @author Asset Tokenization Studio Team
 * @notice Interface for querying the token's nominal value and its decimals at the time of a
 *         previously taken snapshot.
 * @dev    Reads are delegated to `SnapshotsStorageWrapper`, which resolves the snapshot index
 *         recorded by `takeSnapshot`. When no snapshot value is stored for the requested id,
 *         the current nominal value from `NominalValueStorageWrapper` is returned.
 *         Reverts with `SnapshotIdNull` when `_snapshotID == 0` and with
 *         `SnapshotIdDoesNotExists` for unknown identifiers.
 */
interface INominalValueAtSnapshot {
    /**
     * @notice Emitted once when the nominal-value-at-snapshot capability is initialised on a token.
     * @dev Fires exclusively from `initializeNominalValueAtSnapshot`.
     */
    event NominalValueAtSnapshotInitialized();

    /**
     * @notice Initialises the nominal-value-at-snapshot capability on the token.
     * @dev Callable once; subsequent calls revert with `FacetAlreadyRegistered`.
     *      Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment.
     */
    function initializeNominalValueAtSnapshot() external;

    /**
     * @notice Returns the nominal value of the token at the time of a given snapshot.
     * @dev    Resolved against the `nominalValueSnapshots` series; falls back to the live
     *         nominal value when the snapshot id predates any recorded change.
     * @param  _snapshotID    The snapshot identifier returned by a prior `takeSnapshot` call.
     * @return nominalValue_  The nominal value recorded at `_snapshotID`.
     */
    function nominalValueAtSnapshot(uint256 _snapshotID) external view returns (uint256 nominalValue_);

    /**
     * @notice Returns the decimals applied to the nominal value at the time of a given snapshot.
     * @dev    Resolved against the `nominalValueDecimalsSnapshots` series; falls back to the
     *         live decimals value when the snapshot id predates any recorded change.
     * @param  _snapshotID           The snapshot identifier returned by a prior `takeSnapshot` call.
     * @return nominalValueDecimals_ The nominal value decimals recorded at `_snapshotID`.
     */
    function nominalValueDecimalsAtSnapshot(uint256 _snapshotID) external view returns (uint256 nominalValueDecimals_);
}
