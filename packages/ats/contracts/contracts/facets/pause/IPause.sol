// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/// @custom:hash resolverKey Pause
bytes32 constant RESOLVER_KEY_PAUSE = 0x472ad8280a7d90bcd8b7876cad2cd5a4a2d31c116563ace7a685aff94eae8928;

/**
 * @title IPause
 * @author Asset Tokenization Studio Team
 * @notice Interface for pausing and unpausing a security token. When paused, all
 *         transfer-related operations are blocked. The effective pause state is the logical OR of
 *         the token's own pause flag and the pause state of any registered external pause
 *         contracts.
 * @dev Part of the Diamond facet system. Pause state is stored via `PauseStorageWrapper`.
 *      `ROLE_PAUSER` is required for `pause` and `unpause`. `isPaused` consults both the
 *      internal flag and every external pause contract registered via
 *      `ExternalPauseManagementFacet`; any single paused source makes the whole token paused.
 *      Clearing the internal flag with `unpause` does not override active external pauses.
 */
interface IPause {
    /**
     * @notice Emitted when the token's internal pause flag is set to `true`.
     * @param operator Address of the caller who triggered the pause.
     */
    event Paused(address indexed operator);

    /**
     * @notice Emitted when the token's internal pause flag is cleared to `false`.
     * @param operator Address of the caller who triggered the unpause.
     */
    event Unpaused(address indexed operator);

    /**
     * @notice Thrown when an operation that requires the token to be unpaused is attempted while
     *         the token is paused (own flag or any external pause contract).
     */
    error IsPaused();

    /**
     * @notice Thrown when `unpause` is called while the token's internal pause flag is already
     *         cleared.
     */
    error IsUnpaused();

    /**
     * @notice Sets the token's internal pause flag, blocking all guarded operations.
     * @dev Requires `ROLE_PAUSER` and the token to be currently unpaused. Reverts with
     *      `IsPaused` if the token is already paused. Emits `Paused`.
     * @return success_ True if the token was successfully paused.
     */
    function pause() external returns (bool success_);

    /**
     * @notice Clears the token's internal pause flag, restoring guarded operations.
     * @dev Requires `ROLE_PAUSER` and the token's internal flag to be set. Reverts with
     *      `IsUnpaused` if the internal flag is already cleared. Emits `Unpaused`.
     *      Note: if any external pause contract remains paused, `isPaused` will still return
     *      `true` after this call.
     * @return success_ True if the internal pause flag was successfully cleared.
     */
    function unpause() external returns (bool success_);

    /**
     * @notice Checks whether the token is currently paused.
     * @dev Returns `true` if the token's own pause flag is set, or if any registered external
     *      pause contract returns `true` from its `isPaused()` call (OR semantics).
     *      created to be compatible with ERC3643
     * @return True if the token is paused by any source, false otherwise.
     */
    function paused() external view returns (bool);
}
