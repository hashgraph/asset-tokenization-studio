// SPDX-License-Identifier: Apache-2.0
// Contract copy-pasted form OZ and extended

pragma solidity >=0.8.0 <0.9.0;

/// @custom:hash resolverKey Deactivate
bytes32 constant RESOLVER_KEY_DEACTIVATE = 0x13d8bdda80bdc4e1d1af80d2096fdf84affb60341d7b8f44392412162d3c3434;

/**
 * @title IDeactivate
 * @author Asset Tokenization Studio Team
 * @notice Interface for the irreversible deactivation flag of a security token. Once a token is
 *         deactivated, every operation guarded by the `onlyActivated` modifier reverts with
 *         `Deactivated`, effectively retiring the token from active use.
 * @dev Part of the Diamond facet system. Deactivation state is stored via
 *      `DeactivateStorageWrapper` under a dedicated storage slot. The transition `active →
 *      deactivated` is one-way: there is no companion `reactivate` selector. `ROLE_TEST`
 *      is required to flip the flag.
 */
interface IDeactivate {
    /**
     * @notice Emitted once when the deactivate capability is initialised on a token.
     * @dev Fires exclusively from `initializeDeactivate`.
     */
    event DeactivateInitialized();

    /**
     * @notice Thrown when an operation guarded by `onlyActivated` is attempted on a token whose
     *         deactivation flag has already been set.
     */
    error Deactivated();

    /**
     * @notice Initialises the deactivate capability on the token.
     * @dev Callable once; subsequent calls revert with `FacetAlreadyRegistered`.
     *      Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment.
     */
    function initializeDeactivate() external;

    /**
     * @notice Sets the token's deactivation flag, retiring the token irreversibly.
     * @dev Requires `ROLE_TEST`, the token to be currently unpaused, and the token to be
     *      currently activated. Reverts with `AccountHasNoRole`, `IsPaused`, or
     *      `Deactivated` respectively when those preconditions fail. The state change is
     *      one-way and cannot be undone.
     */
    function deactivate() external;

    /**
     * @notice Reports whether the token has been deactivated.
     * @return True if `deactivate` has previously been invoked, false otherwise.
     */
    function isDeactivated() external view returns (bool);
}
