// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ISnapshotsTypes } from "../snapshot/ISnapshotsTypes.sol";

/// @custom:hash resolverKey SnapshotsByPartition
// solhint-disable-next-line max-line-length
bytes32 constant RESOLVER_KEY_SNAPSHOTS_BY_PARTITION = 0x37c825560f21710d66419d4eefeb45ae2dadf078b1db5593749d24a7d38465ee;

/// @title ISnapshotsByPartition
/// @author Asset Tokenization Studio Team
/// @notice Interface for the SnapshotsByPartition facet, exposing partition-level snapshot reads.

interface ISnapshotsByPartition is ISnapshotsTypes {
    /**
     * @notice Emitted once when the snapshots-by-partition capability is initialised on a token.
     * @dev Fires exclusively from `initializeSnapshotsByPartition`.
     */
    event SnapshotsByPartitionInitialized();

    /**
     * @notice Initialises the snapshots-by-partition capability on the token.
     * @dev Callable once; subsequent calls revert with `FacetAlreadyRegistered`.
     *      Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment.
     */
    function initializeSnapshotsByPartition() external;

    /// @notice Returns the list of partitions held by an account at the time of a given snapshot.
    /// @dev Reverts with {SnapshotIdNull} when `_snapshotID` is zero, and with
    ///      {SnapshotIdDoesNotExists} when the snapshot identifier does not correspond to a
    ///      previously taken snapshot.
    /// @param _snapshotID Identifier of the snapshot to query.
    /// @param _tokenHolder Address of the account whose partition list is being queried.
    /// @return Ordered list of partition identifiers held by `_tokenHolder` at snapshot time.
    function partitionsOfAtSnapshot(uint256 _snapshotID, address _tokenHolder) external view returns (bytes32[] memory);
}
