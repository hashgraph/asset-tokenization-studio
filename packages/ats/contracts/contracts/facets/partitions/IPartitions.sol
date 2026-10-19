// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @custom:hash resolverKey Partitions
bytes32 constant RESOLVER_KEY_PARTITIONS = 0x9caef059931effa6169ed564cfd0d8dac03be612be61f4fc934e8554cfe1c53f;

/**
 * @title IPartitions
 * @author Asset Tokenization Studio Team
 * @notice Interface exposing the partition-discovery accessors required by the ERC-1410 surface.
 * @dev Hosts the read-only `partitionsOf` and `isMultiPartition` getters. Implementations are
 *      expected to be pure passthroughs onto the underlying ERC-1410 storage and therefore
 *      impose no additional access-control or pause guarantees.
 */
interface IPartitions {
    /**
     * @notice Emitted once when the partitions capability is initialised on a token.
     * @dev Fires exclusively from `initializePartitions`.
     * @param multiPartition Whether the token operates in multi-partition mode.
     */
    event PartitionsInitialized(bool multiPartition);

    /**
     * @notice Initialises the partitions capability on the token and sets multi-partition mode.
     * @dev Callable once; subsequent calls revert with `FacetAlreadyRegistered`.
     *      Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment.
     * @param _multiPartition When `true`, the token accepts partitions other than the default.
     */
    function initializePartitions(bool _multiPartition) external;

    /**
     * @notice Use to get the list of partitions `_tokenHolder` is associated with.
     * @param _tokenHolder An address corresponds whom partition list is queried.
     * @return List of partitions.
     */
    function partitionsOf(address _tokenHolder) external view returns (bytes32[] memory);

    /**
     * @notice Indicates whether the token operates in multi-partition mode.
     * @return True if the token allows multiple partitions to be set and managed; false otherwise
     */
    function isMultiPartition() external view returns (bool);
}
