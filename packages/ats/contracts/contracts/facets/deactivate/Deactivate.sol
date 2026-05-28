// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IDeactivate, RESOLVER_KEY_DEACTIVATE } from "./IDeactivate.sol";
import { DeactivateStorageWrapper } from "../../domain/core/DeactivateStorageWrapper.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { ROLE_DEACTIVATE, DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";

/**
 * @title Deactivate
 * @author Asset Tokenization Studio Team
 * @notice Abstract contract implementing the irreversible deactivation logic for a security
 *         token.
 * @dev Implements `IDeactivate`. Deactivation state is stored via `DeactivateStorageWrapper`,
 *      which writes to a dedicated diamond storage slot. Intended to be inherited exclusively
 *      by `DeactivateFacet`. The state change is one-way: once the flag is set, the
 *      `onlyActivated` modifier blocks any further `deactivate` call as well as every other
 *      facet operation guarded by it.
 */
abstract contract Deactivate is IDeactivate, Modifiers {
    /// @inheritdoc IDeactivate
    function initializeDeactivate()
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyFacetNotRegistered(RESOLVER_KEY_DEACTIVATE)
    {
        InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_DEACTIVATE);
        emit DeactivateInitialized();
    }

    /// @inheritdoc IDeactivate
    /// @dev Composed of three preconditions: `onlyUnpaused` rejects the call when the token is
    ///      paused (own flag or any external onlyOperational pause source), `onlyRole(ROLE_DEACTIVATE)`
    ///      enforces caller authorisation, and `onlyActivated` makes the transition idempotent
    ///      by reverting with `Deactivated` on a token that is already retired.
    function deactivate() external override onlyOperational onlyUnpaused onlyRole(ROLE_DEACTIVATE) onlyActivated {
        DeactivateStorageWrapper.deactivate();
    }

    /// @inheritdoc IDeactivate
    function isDeactivated() external view override returns (bool) {
        return DeactivateStorageWrapper.isDeactivated();
    }
}
