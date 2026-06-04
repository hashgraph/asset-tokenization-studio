// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @custom:hash resolverKey BatchFreeze
bytes32 constant RESOLVER_KEY_BATCH_FREEZE = 0x6ddbb1869dce32d8e2c9bb2d23fad216723298560b6cceba67890d5a3efe0e5e;

/**
 * @title IBatchFreeze
 * @notice Interface for batch freezing and unfreezing addresses and partial tokens.
 * @dev Provides ERC3643-compliant batch freeze operations. Batch functions only work in
 *      single-partition mode. Events are shared with `IFreeze` (TokensFrozen, TokensUnfrozen,
 *      AddressFrozen).
 */
interface IBatchFreeze {
    /**
     * @notice Emitted once when the batch freeze capability is initialised on a token.
     * @dev Fires exclusively from `initializeBatchFreeze` after the storage write succeeds.
     */
    event BatchFreezeInitialized();

    /**
     * @notice Initialises the batch freeze capability on the token.
     * @dev Callable once; subsequent calls revert with `FacetAlreadyRegistered`.
     *      Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment.
     */
    function initializeBatchFreeze() external;

    /**
     * @notice Batch freezes or unfreezes multiple addresses.
     * @param _userAddresses Array of addresses to freeze/unfreeze.
     * @param _freeze Array of freeze statuses (true = freeze, false = unfreeze).
     *        Must be the same length as `_userAddresses`.
     * @dev Emits `IFreeze.AddressFrozen` for each address. Only callable by
     *      `ROLE_FREEZE_MANAGER` or `ROLE_AGENT`. Token must be unpaused.
     */
    function batchSetAddressFrozen(address[] calldata _userAddresses, bool[] calldata _freeze) external;

    /**
     * @notice Batch freezes partial tokens for multiple addresses.
     * @param _userAddresses Array of addresses to freeze tokens for.
     * @param _amounts Corresponding token amounts to freeze. Must be the same length
     *        as `_userAddresses`. Only works in single-partition mode.
     * @dev Emits `IFreeze.TokensFrozen` for each address. Token must be unpaused.
     */
    function batchFreezePartialTokens(address[] calldata _userAddresses, uint256[] calldata _amounts) external;

    /**
     * @notice Batch unfreezes partial tokens for multiple addresses.
     * @param _userAddresses Array of addresses to unfreeze tokens for.
     * @param _amounts Corresponding token amounts to unfreeze. Must be the same length
     *        as `_userAddresses`. Only works in single-partition mode.
     * @dev Emits `IFreeze.TokensUnfrozen` for each address. Token must be unpaused.
     */
    function batchUnfreezePartialTokens(address[] calldata _userAddresses, uint256[] calldata _amounts) external;
}
