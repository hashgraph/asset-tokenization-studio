// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title ICapByPartition
 * @author Asset Tokenization Studio Team
 * @notice Interface for managing the per-partition maximum supply cap of a token.
 * @dev The partition-scoped cap sits underneath the global cap declared in `ICap`. Setting a
 *      partition cap requires the `CAP_ROLE` and the token to be unpaused; the cap value is
 *      validated against the partition's current total supply and the global max supply both
 *      adjusted for any pending balance adjustments. Reads expose the same balance-adjusted
 *      view, so values returned reflect scheduled adjustments effective at the current block
 *      timestamp.
 */
interface ICapByPartition {
    /**
     * @notice Sets the maximum supply cap for a specific partition of the token.
     * @dev Reverts with `NewMaxSupplyForPartitionTooLow` when `_maxSupply` is below the
     *      partition's adjusted total supply, and with `NewMaxSupplyByPartitionTooHigh` when
     *      it exceeds the global max supply. Emits {MaxSupplyByPartitionSet}.
     * @param _partition The partition identifier whose cap is being updated.
     * @param _maxSupply The new maximum supply value for the partition.
     * @return success_ True when the cap is updated.
     */
    function setMaxSupplyByPartition(bytes32 _partition, uint256 _maxSupply) external returns (bool success_);

    /**
     * @notice Returns the maximum supply cap currently in effect for a partition.
     * @dev The returned value is adjusted for pending balance adjustments effective at the
     *      current block timestamp.
     * @param _partition The partition identifier to query.
     * @return maxSupply_ The balance-adjusted maximum supply for `_partition`.
     */
    function getMaxSupplyByPartition(bytes32 _partition) external view returns (uint256 maxSupply_);
}
