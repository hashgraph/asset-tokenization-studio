// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title IBurnByPartition
 * @author Asset Tokenization Studio Team
 * @notice Interface for the partition-aware token redemption entry point of the ATS Diamond.
 * @dev Exposes `redeemByPartition` which follows the ERC-1410 standard for redeeming (burning)
 *      tokens from a specific partition. The operation decreases the total supply and the
 *      partition supply and emits the `RedeemedByPartition` event.
 */
interface IBurnByPartition {
    /**
     * @notice Emitted once when the burn by partition capability is initialised on a token.
     * @dev Fires exclusively from `initializeBurnByPartition`.
     */
    event BurnByPartitionInitialized();

    /**
     * @notice Initialises the burn by partition capability on the token.
     * @dev Callable once; subsequent calls revert with `FacetAlreadyRegistered`.
     *      Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment.
     */
    function initializeBurnByPartition() external;

    /**
     * @notice Decreases totalSupply and the corresponding amount of the specified partition of msg.sender
     * @dev Only callable when not paused. In single-partition mode only the default partition is accepted.
     *      The caller must pass redemption authorization checks for the given partition and amount.
     * @param _partition The partition from which to redeem tokens
     * @param _value The amount of tokens to redeem
     * @param _data Additional data attached to the redemption
     */
    function redeemByPartition(bytes32 _partition, uint256 _value, bytes calldata _data) external;
}
