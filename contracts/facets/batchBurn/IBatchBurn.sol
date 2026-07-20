// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @custom:hash resolverKey BatchBurn
bytes32 constant RESOLVER_KEY_BATCH_BURN = 0x60fbdebafe46599d2a6d6cbec0e554cfdf693e5eb001a783852bbbc82e5c9984;

/**
 * @title IBatchBurn
 * @notice Interface for batch burning tokens from multiple addresses in a single transaction.
 * @dev Intended for use by authorised controllers and agents operating on ERC3643-compliant tokens.
 *      Exposes the `batchBurn` selector registered in the Diamond proxy under `RESOLVER_KEY_BATCH_BURN`.
 * @author Asset Tokenization Studio Team
 */
interface IBatchBurn {
    /**
     * @notice Emitted once when the batch burn capability is initialised on a token.
     * @dev Fires exclusively from `initializeBatchBurn` after the storage write succeeds.
     */
    event BatchBurnInitialized();

    /**
     * @notice Initialises the batch burn capability on the token.
     * @dev Callable once; subsequent calls revert with `FacetAlreadyRegistered`.
     *      Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment.
     */
    function initializeBatchBurn() external;

    /**
     * @notice Burns tokens from multiple addresses in a single transaction.
     * @dev Caller must hold `ROLE_CONTROLLER` or `ROLE_AGENT`. The token must not be paused
     *      and must not be configured for multi-partition. Emits `IController.ControllerRedemption`
     *      for each address processed.
     * @param _userAddresses Addresses from which tokens will be burnt.
     * @param _amounts Corresponding token amounts to burn. Must be the same length as `_userAddresses`.
     */
    function batchBurn(address[] calldata _userAddresses, uint256[] calldata _amounts) external;
}
