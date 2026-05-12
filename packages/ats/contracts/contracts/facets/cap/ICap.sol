// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title ICap
 * @author Asset Tokenization Studio Team
 * @notice Interface for managing the maximum token supply of a security token, both globally and
 *         per partition. The cap enforces an upper bound on minting and may be updated by
 *         authorised callers provided the new cap is not below the current total supply.
 * @dev Part of the Diamond facet system. Cap state is stored at `_CAP_STORAGE_POSITION` via
 *      `CapStorageWrapper`. `CAP_ROLE` is required to update the cap after initialisation.
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
     * @notice Thrown when a proposed new partition cap exceeds the global maximum supply,
     *         violating the invariant that no partition cap may be greater than the global cap.
     * @param partition The partition for which the cap was proposed.
     * @param newMaxSupplyByPartition The proposed partition cap.
     * @param maxSupply The current global maximum supply.
     */
    error NewMaxSupplyByPartitionTooHigh(bytes32 partition, uint256 newMaxSupplyByPartition, uint256 maxSupply);

    /**
     * @notice One-time initialiser that sets the global maximum supply and optional per-partition
     *         caps.
     * @dev Can only be called once; subsequent calls revert via `onlyNotCapInitialized`. The new
     *      cap is validated to be non-zero and at least equal to the current adjusted total
     *      supply. The leading-underscore naming convention signals this is an initialiser.
     *      Partition caps in `partitionCap` must each be no greater than `maxSupply`.
     * @param maxSupply The global maximum token supply to set.
     * @param partitionCap Array of per-partition cap configurations to initialise.
     */
    function initializeCap(uint256 maxSupply, PartitionCap[] calldata partitionCap) external;

    /**
     * @notice Updates the global maximum supply of the token.
     * @dev Requires `CAP_ROLE` and the token to be unpaused. The new cap must be non-zero and
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
