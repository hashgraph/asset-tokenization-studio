// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title IBalanceTracker
 * @notice Interface for querying token balances and total supply across all partitions,
 *         with support for time-adjusted values that simulate pending balance adjustments.
 * @dev All read operations resolve the current block timestamp via `TimeTravelStorageWrapper`,
 *      enabling deterministic results in test environments without altering production behaviour.
 */
interface IBalanceTracker {
    /**
     * @notice Returns the total token balance of a token holder across all partitions,
     * including locked and held amounts, simulating non-triggered balance adjustments up to the current timestamp.
     * @param _tokenHolder The address of the token holder
     * @return The adjusted total balance
     */
    function balanceOf(address _tokenHolder) external view returns (uint256);

    /**
     * @notice Returns the total token supply across all partitions,
     * simulating non-triggered supply adjustments up to the current timestamp.
     * @return The adjusted total supply
     */
    function totalSupply() external view returns (uint256);

    /**
     * @notice Returns the total balance held by an account across all partitions,
     * including locked tokens, held tokens and clearing amounts,
     * simulating non-triggered adjustments up to the current timestamp.
     * @param _account The address of the account
     * @return The adjusted total balance for the account
     */
    function getTotalBalanceFor(address _account) external view returns (uint256);
}
