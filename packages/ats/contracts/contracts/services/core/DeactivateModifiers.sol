// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { DeactivateStorageWrapper } from "../../domain/core/DeactivateStorageWrapper.sol";

/**
 * @title DeactivateModifiers
 * @author Asset Tokenization Studio Team
 * @notice Reusable modifier mix-in that gates state-mutating flows on the token's activation
 *         status, blocking any operation once the token has been irreversibly deactivated.
 * @dev Inherited by facets and services that must reject calls after deactivation. Delegates the
 *      check to `DeactivateStorageWrapper.requireActivated`, which reads the diamond storage
 *      flag and reverts with `IDeactivate.Deactivated`. Marked `abstract` because it carries no
 *      standalone behaviour — it exists solely to be inherited.
 */
abstract contract DeactivateModifiers {
    /**
     * @notice Reverts when the token has already been deactivated, otherwise yields to the
     *         guarded function body.
     * @dev Pre-execution guard — the wrapped function never runs if the deactivation flag is
     *      set. Apply to every entry point whose semantics must not survive deactivation
     *      (transfers, mints, corporate actions, etc.). The check is a single SLOAD on the
     *      diamond storage slot and adds no further state changes.
     */
    modifier onlyActivated() {
        DeactivateStorageWrapper.requireActivated();
        _;
    }
}
