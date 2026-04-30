// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title IPause
 * @author Asset Tokenization Studio Team
 * @notice Interface for pausing and unpausing a security token. When paused, all
 *         transfer-related operations are blocked. The effective pause state is the logical OR of
 *         the token's own pause flag and the pause state of any registered external pause
 *         contracts.
 * @dev Part of the Diamond facet system. Pause state is stored via `PauseStorageWrapper`.
 *      `PAUSER_ROLE` is required for `pause` and `unpause`. `isPaused` consults both the
 *      internal flag and every external pause contract registered via
 *      `ExternalPauseManagementFacet`; any single paused source makes the whole token paused.
 *      Clearing the internal flag with `unpause` does not override active external pauses.
 */
interface IPause {
    /**
     * @notice Emitted when the token's internal pause flag is set to `true`.
     * @param operator Address of the caller who triggered the pause.
     */
    event TokenPaused(address indexed operator);

    /**
     * @notice Emitted when the token's internal pause flag is cleared to `false`.
     * @param operator Address of the caller who triggered the unpause.
     */
    event TokenUnpaused(address indexed operator);

    /**
     * @notice Thrown when an operation that requires the token to be unpaused is attempted while
     *         the token is paused (own flag or any external pause contract).
     */
    error TokenIsPaused();

    /**
     * @notice Thrown when `unpause` is called while the token's internal pause flag is already
     *         cleared.
     */
    error TokenIsUnpaused();

    /**
     * @notice Sets the token's internal pause flag, blocking all guarded operations.
     * @dev Requires `PAUSER_ROLE` and the token to be currently unpaused. Reverts with
     *      `TokenIsPaused` if the token is already paused. Emits `TokenPaused`.
     * @return success_ True if the token was successfully paused.
     */
    function pause() external returns (bool success_);

    /**
     * @notice Clears the token's internal pause flag, restoring guarded operations.
     * @dev Requires `PAUSER_ROLE` and the token's internal flag to be set. Reverts with
     *      `TokenIsUnpaused` if the internal flag is already cleared. Emits `TokenUnpaused`.
     *      Note: if any external pause contract remains paused, `isPaused` will still return
     *      `true` after this call.
     * @return success_ True if the internal pause flag was successfully cleared.
     */
    function unpause() external returns (bool success_);

    /**
     * @notice Checks whether the token is currently paused.
     * @dev Returns `true` if the token's own pause flag is set, or if any registered external
     *      pause contract returns `true` from its `isPaused()` call (OR semantics).
     * @return True if the token is paused by any source, false otherwise.
     */
    function isPaused() external view returns (bool);
}
