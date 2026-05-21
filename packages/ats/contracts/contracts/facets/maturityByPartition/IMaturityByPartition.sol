// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title IMaturityByPartition
 * @author Asset Tokenization Studio Team
 * @notice Interface for redeeming a specified amount of tokens from a partition at
 *         bond maturity.
 * @dev The caller must hold MATURITY_REDEEMER_ROLE. The contract must be unpaused and
 *      clearing disabled. The token holder must be on the allowed list with granted KYC
 *      status, must not be recovered, and the maturity date must have passed. In
 *      single-partition mode, the partition must be the default partition. In
 *      multi-partition mode, any partition is allowed.
 */
interface IMaturityByPartition {
    /**
     * @notice Emitted once when the maturity-by-partition capability is initialised on a token.
     * @dev Fires exclusively from `initializeMaturityByPartition`.
     */
    event MaturityByPartitionInitialized();

    /**
     * @notice Initialises the maturity-by-partition capability on the token.
     * @dev Callable once; subsequent calls revert with `FacetAlreadyRegistered`.
     *      Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment.
     */
    function initializeMaturityByPartition() external;

    /**
     * @notice Redeems a specified amount of tokens from a single partition at bond
     *         maturity.
     * @dev Emits a Transfer event on successful redemption via
     *      ERC1410StorageWrapper.redeemByPartition.
     * @param _tokenHolder Address of the token holder to redeem.
     * @param _partition Partition identifier to redeem from.
     * @param _amount Amount of tokens to redeem.
     */
    function redeemAtMaturityByPartition(address _tokenHolder, bytes32 _partition, uint256 _amount) external;
}
