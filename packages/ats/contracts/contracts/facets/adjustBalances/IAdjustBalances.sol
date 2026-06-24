// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @custom:hash resolverKey BalanceAdjustments
bytes32 constant RESOLVER_KEY_BALANCE_ADJUSTMENTS = 0x0d52158578e1e30e77e2dd3caffc1aa31af5397866b92131f66858f01b2e8f01;

/**
 * @title IAdjustBalances
 * @author Asset Tokenization Studio Team
 * @notice Interface for immediate balance adjustment corporate actions on tokenised assets.
 * @dev Balance adjustments multiply every token holder's balance by `factor / 10^decimals`.
 *      Immediate adjustments execute synchronously. Scheduled adjustments are handled by
 *      the `IScheduledBalanceAdjustment` interface and facet.
 */
interface IAdjustBalances {
    /**
     * @notice Emitted when an immediate balance adjustment is applied.
     * @param operator Address that triggered the adjustment.
     * @param factor   Numerator of the adjustment ratio.
     * @param decimals Denominator exponent; effective ratio = factor / 10^decimals.
     */
    event AdjustmentBalanceSet(address indexed operator, uint256 factor, uint8 decimals);

    /**
     * @notice Emitted once when the balance adjustment capability is initialised on a token.
     * @dev Fires exclusively from `initializeBalanceAdjustments` after the storage write succeeds.
     */
    event BalanceAdjustmentsInitialized();

    /// @notice Reverts when `factor` is zero, which would zero-out all holder balances.
    error FactorIsZero();

    /// @notice Reverts when the proposed factor would overflow the cumulative ABAF.
    error FactorOverflow();

    /// @notice Reverts when the cumulative decimals shift would overflow `uint8`.
    error DecimalsOverflow();

    /// @notice Reverts when the proposed factor would overflow the projected total supply.
    error TotalSupplyOverflow();

    /**
     * @notice Initialises the balance adjustment capability on the token.
     * @dev Callable once; subsequent calls revert with `FacetAlreadyRegistered`.
     *      Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment.
     */
    function initializeBalanceAdjustments() external;

    /**
     * @notice Applies a balance adjustment to all token holders immediately.
     * @dev Caller must hold `ROLE_ADJUSTMENT_BALANCE`. The token must not be paused and `factor`
     *      must be non-zero. Pending scheduled tasks at index 0 are triggered before the adjustment
     *      is applied, ensuring consistent ordering.
     * @param factor   Numerator of the multiplier; effective ratio = factor / 10^decimals.
     * @param decimals Denominator exponent.
     * @return success_ True if the adjustment was applied without reverting.
     */
    function adjustBalances(uint256 factor, uint8 decimals) external returns (bool success_);

    /**
     * @notice Triggers pending scheduled tasks and synchronises the balance snapshot for a transfer pair.
     * @dev Delegates to `TokenCoreOps.triggerAndSyncAll`. Must be called before any token transfer
     *      that should reflect the latest adjustment state. The token must not be paused.
     * @param _partition Partition identifier of the transfer.
     * @param _from      Sender address whose snapshot is synchronised.
     * @param _to        Recipient address whose snapshot is synchronised.
     */
    function triggerAndSyncAll(bytes32 _partition, address _from, address _to) external;
}
