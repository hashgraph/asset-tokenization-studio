// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @custom:hash resolverKey CoreAdjusted
bytes32 constant RESOLVER_KEY_CORE_ADJUSTED = 0xe190b52312c215f8e240bb53f0aa3e51e31b3005b7fcfb49c730ae523e675cfd;

/**
 * @title ICoreAdjusted
 * @notice Interface exposing time-adjusted ERC-20 decimal reads for the CoreAdjusted facet.
 * @dev Complements `ICore.decimals()`, which always resolves to the current block timestamp.
 *      This interface allows callers to query what the effective decimal precision would be at
 *      an arbitrary point in time, accounting for any pending scheduled balance adjustments
 *      (ABAFs) that have not yet been triggered on-chain.
 */
interface ICoreAdjusted {
    /**
     * @notice Emitted once when the core adjusted capability is initialised on a token.
     * @dev Fires exclusively from `initializeCoreAdjusted`.
     */
    event CoreAdjustedInitialized();

    /**
     * @notice Initialises the core adjusted capability on the token.
     * @dev Callable once; subsequent calls revert with `FacetAlreadyRegistered`.
     *      Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment.
     */
    function initializeCoreAdjusted() external;

    /**
     * @notice Returns the effective token decimals at a given timestamp, simulating all pending
     *         scheduled balance adjustments (ABAFs) up to and including that timestamp.
     * @dev Delegates to `ERC20StorageWrapper.decimalsAdjustedAt`. Adjustments with an
     *      `executionDate` strictly greater than `_timestamp` are excluded. No state mutation
     *      occurs; this is a pure simulation.
     * @param _timestamp The Unix timestamp up to which pending ABAFs are simulated.
     * @return The effective decimal precision of the token at the specified timestamp.
     */
    function decimalsAt(uint256 _timestamp) external view returns (uint8);
}
