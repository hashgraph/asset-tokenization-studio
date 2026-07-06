// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @custom:hash resolverKey Cap
bytes32 constant RESOLVER_KEY_CAP = 0x88a28e7c45a3ce8d4ca60cd480c98e1b46feb84caec725cb0a6cf96b2c5143b5;

/**
 * @title ICap
 * @author Asset Tokenization Studio Team
 * @notice Interface for managing the maximum token supply of a security token, both globally and
 *         per partition. The cap enforces an upper bound on minting and may be updated by
 *         authorised callers provided the new cap is not below the current total supply.
 * @dev Part of the Diamond facet system. Cap state is stored at `STORAGE_LOCATION_CAP` via
 *      `CapStorageWrapper`. `ROLE_CAP` is required to update the cap after initialisation.
 *      `getMaxSupply` returns the cap adjusted for any pending scheduled balance-adjustment
 *      factor (ABAF); if the adjusted value would overflow `uint256` it saturates to
 *      `MAX_UINT256`. Partition caps are initialised once alongside the global cap and updated
 *      through separate partition-scoped functions not exposed by this interface.
 */
interface ICap {
    /**
     * @notice Groups a partition identifier with its maximum supply for initialisation.
     * @param partition The partition identifier.
     * @param maxSupply The maximum token supply allowed for this partition.
     */
    struct PartitionCap {
        bytes32 partition;
        uint256 maxSupply;
    }

    /**
     * @notice Emitted once when the Cap capability is initialised on a token.
     * @dev Fires exclusively from `initializeCap` after the storage write succeeds.
     * @param maxSupply The global maximum token supply set during initialisation.
     * @param partitionCap Array of per-partition cap configurations.
     */
    event CapInitialized(uint256 maxSupply, ICap.PartitionCap[] partitionCap);

    /**
     * @notice Emitted when the global maximum supply is updated.
     * @param operator Address of the caller who performed the update.
     * @param newMaxSupply The new maximum supply value.
     * @param previousMaxSupply The previous maximum supply value.
     */
    event MaxSupplySet(address indexed operator, uint256 newMaxSupply, uint256 previousMaxSupply);

    /**
     * @notice Emitted when the maximum supply for a specific partition is updated.
     * @param operator Address of the caller who performed the update.
     * @param partition The partition whose cap was changed.
     * @param newMaxSupply The new maximum supply value for the partition.
     * @param previousMaxSupply The previous maximum supply value for the partition.
     */
    event MaxSupplyByPartitionSet(
        address indexed operator,
        bytes32 indexed partition,
        uint256 newMaxSupply,
        uint256 previousMaxSupply
    );

    /**
     * @notice Thrown when a mint would cause the total supply to exceed the global maximum.
     * @param maxSupply The current global maximum supply.
     */
    error MaxSupplyReached(uint256 maxSupply);

    /**
     * @notice Thrown when a mint would cause a partition's total supply to exceed its cap.
     * @param partition The partition whose cap would be exceeded.
     * @param maxSupply The current maximum supply for the partition.
     */
    error MaxSupplyReachedForPartition(bytes32 partition, uint256 maxSupply);

    /**
     * @notice Thrown when a proposed new global cap is below the current adjusted total supply.
     * @param maxSupply The proposed new maximum supply.
     * @param totalSupply The current adjusted total supply that exceeds it.
     */
    error NewMaxSupplyTooLow(uint256 maxSupply, uint256 totalSupply);

    /**
     * @notice Thrown when a proposed new global cap is zero.
     */
    error NewMaxSupplyCannotBeZero();

    /**
     * @notice Thrown when a proposed new partition cap is below the partition's current adjusted
     *         total supply.
     * @param partition The partition whose cap would be set below its current supply.
     * @param maxSupply The proposed new maximum supply for the partition.
     * @param totalSupply The current adjusted total supply for the partition.
     */
    error NewMaxSupplyForPartitionTooLow(bytes32 partition, uint256 maxSupply, uint256 totalSupply);

    /**
     * @notice One-time initialiser that sets the global maximum supply and optional per-partition
     *         caps.
     * @dev Can only be called once; subsequent calls revert via `onlyFacetNotRegistered`. The new
     *      cap is validated to be non-zero and at least equal to the current adjusted total
     *      supply. Partition caps in `partitionCap` must each be no greater than `maxSupply`.
     * @param _maxSupply The global maximum token supply to set.
     * @param _partitionCap Array of per-partition cap configurations to initialise.
     */
    function initializeCap(uint256 _maxSupply, PartitionCap[] calldata _partitionCap) external;

    /**
     * @notice Updates the global maximum supply of the token.
     * @dev Requires `ROLE_CAP` and the token to be unpaused. The new cap must be non-zero and
     *      at least equal to the current adjusted total supply. Emits `MaxSupplySet`.
     * @param _maxSupply The new global maximum supply.
     * @return success_ True if the cap was successfully updated.
     */
    function setMaxSupply(uint256 _maxSupply) external returns (bool success_);

    /**
     * @notice Returns the current effective maximum supply.
     * @dev The raw stored cap is multiplied by any pending scheduled balance-adjustment factor
     *      (ABAF) at the current block timestamp. If the product would overflow `uint256`, the
     *      value saturates to `MAX_UINT256`.
     * @return maxSupply_ The effective maximum supply at the current timestamp.
     */
    function getMaxSupply() external view returns (uint256 maxSupply_);
}
