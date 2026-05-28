// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @custom:hash resolverKey BalanceTrackerAdjusted
// solhint-disable-next-line max-line-length
bytes32 constant RESOLVER_KEY_BALANCE_TRACKER_ADJUSTED = 0xde8fb5b2c9dd63c753422ecea8bad989281451fa65dff90dd686eff691b03805;

/**
 * @title IBalanceTrackerAdjusted
 * @notice Interface for querying historical token balances at a specific timestamp,
 *         simulating non-triggered balance adjustments up to that point in time.
 * @dev Reads are delegated to `ERC1410StorageWrapper.balanceOfAdjustedAt`.
 *      The timestamp is caller-supplied, enabling point-in-time balance reconstruction.
 */
interface IBalanceTrackerAdjusted {
    /**
     * @notice Emitted once when the adjusted balance tracker capability is initialised on a token.
     * @dev Fires exclusively from `initializeBalanceTrackerAdjusted` after the storage write succeeds.
     */
    event BalanceTrackerAdjustedInitialized();

    /**
     * @notice Initialises the adjusted balance tracker capability on the token.
     * @dev Callable once; subsequent calls revert with `FacetAlreadyRegistered`.
     *      Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment.
     */
    function initializeBalanceTrackerAdjusted() external;

    /**
     * @notice Returns the total token balance of a token holder at a given timestamp,
     *         simulating non-triggered balance adjustments up to that point in time.
     * @param _tokenHolder The address of the token holder.
     * @param _timestamp   The Unix timestamp at which the balance is evaluated.
     * @return The adjusted total balance of the token holder at `_timestamp`.
     */
    function balanceOfAt(address _tokenHolder, uint256 _timestamp) external view returns (uint256);
}
