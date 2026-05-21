// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

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
     */
    event PartitionsInitialized();

    /**
     * @notice Initialises the partitions capability on the token.
     * @dev Callable once; subsequent calls revert with `FacetAlreadyRegistered`.
     *      Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment.
     */
    function initializePartitions() external;

    /**
     * @notice Use to get the list of partitions `_tokenHolder` is associated with.
     * @param _tokenHolder An address corresponds whom partition list is queried.
     * @return List of partitions.
     */
    function partitionsOf(address _tokenHolder) external view returns (bytes32[] memory);

    /**
     * @notice Indicates whether the token operates in multi-partition mode.
     * @return
     *  true : the token allows multiple partitions to be set and managed.
     *  false : the token contains only one partition, the default one.
     */
    function isMultiPartition() external view returns (bool);
}
