// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @custom:hash resolverKey BalanceTrackerByPartition
// solhint-disable-next-line max-line-length
bytes32 constant RESOLVER_KEY_BALANCE_TRACKER_BY_PARTITION = 0x05d2477d09e6a1df45e3e51bd398af7a071f6f282255486cec19b8b5a403bbaf;

/**
 * @title IBalanceTrackerByPartition
 * @author Asset Tokenization Studio Team
 * @notice Interface for querying token balances and total supply scoped to a specific partition,
 *         with support for time-adjusted values that simulate pending balance adjustments.
 * @dev All read operations resolve the current block timestamp via `EvmAccessors`,
 *      enabling deterministic results in test environments without altering production behaviour.
 */
interface IBalanceTrackerByPartition {
    /**
     * @notice Emitted once when the partition balance tracker capability is initialised on a token.
     * @dev Fires exclusively from `initializeBalanceTrackerByPartition` after the storage write succeeds.
     */
    event BalanceTrackerByPartitionInitialized();

    /**
     * @notice Initialises the partition balance tracker capability on the token.
     * @dev Callable once; subsequent calls revert with `FacetAlreadyRegistered`.
     *      Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment.
     */
    function initializeBalanceTrackerByPartition() external;

    /**
     * @notice Returns the token balance of a holder within a specific partition,
     *         simulating non-triggered balance adjustments up to the current timestamp.
     * @param _partition The partition identifier
     * @param _tokenHolder The address of the token holder
     * @return The adjusted balance of the token holder in the partition
     */
    function balanceOfByPartition(bytes32 _partition, address _tokenHolder) external view returns (uint256);

    /**
     * @notice Returns the total token supply within a specific partition,
     *         simulating non-triggered supply adjustments up to the current timestamp.
     * @param _partition The partition identifier
     * @return The adjusted total supply for the partition
     */
    function totalSupplyByPartition(bytes32 _partition) external view returns (uint256);

    /**
     * @notice Returns the total balance held by an account within a specific partition,
     *         including locked tokens, held tokens, and clearing amounts,
     *         simulating non-triggered adjustments up to the current timestamp.
     * @param _partition The partition identifier
     * @param _account The address of the account
     * @return The adjusted total balance for the account in the partition
     */
    function getTotalBalanceForByPartition(bytes32 _partition, address _account) external view returns (uint256);
}
