// SPDX-License-Identifier: Apache-2.0
// Contract copy-pasted form OZ and extended

pragma solidity >=0.8.0 <0.9.0;

/**
 * @title IDeactivate
 * @author Asset Tokenization Studio Team
 * @notice Interface for the irreversible deactivation flag of a security token. Once a token is
 *         deactivated, every operation guarded by the `onlyActivated` modifier reverts with
 *         `Deactivated`, effectively retiring the token from active use.
 * @dev Part of the Diamond facet system. Deactivation state is stored via
 *      `DeactivateStorageWrapper` under a dedicated storage slot. The transition `active →
 *      deactivated` is one-way: there is no companion `reactivate` selector. `DEACTIVATE_ROLE`
 *      is required to flip the flag.
 */
interface IDeactivate {
    /**
     * @notice Thrown when an operation guarded by `onlyActivated` is attempted on a token whose
     *         deactivation flag has already been set.
     */
    error Deactivated();

    /**
     * @notice Sets the token's deactivation flag, retiring the token irreversibly.
     * @dev Requires `DEACTIVATE_ROLE`, the token to be currently unpaused, and the token to be
     *      currently activated. Reverts with `AccountHasNoRole`, `TokenIsPaused`, or
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
