// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IAccessControl, RESOLVER_KEY_ACCESS_CONTROL } from "./IAccessControl.sol";
import { AccessControlRead } from "./AccessControlRead.sol";
import { AccessControlStorageWrapper } from "../../domain/core/AccessControlStorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";

/**
 * @title AccessControlBase
 * @author Asset Tokenization Studio Team
 * @notice Shared implementation for role-mutating operations, reused by `AccessControl` and
 *         `AccessControlOperational`. Holds the single copy of each operation's storage
 *         mutation and event emission, so the two entry points differ only in the guard
 *         modifiers appropriate to how they are wired into the system.
 * @dev `AccessControl` is inherited directly by non-proxy consumers (e.g. `DiamondCutManager`),
 *      which must remain usable before any diamond configuration is operational.
 *      `AccessControlOperational` is inherited by `AccessControlFacet`, a proxy facet that
 *      additionally requires `onlyOperational`. Solidity modifiers must be declared statically
 *      on the function signature, so the guard difference cannot be parameterised at runtime —
 *      each subclass declares its own thin external function and delegates to the internal
 *      helpers here. `initializeAccessControl` needs no such split: its guards are identical
 *      for both consumers, so it is implemented once and inherited unchanged.
 */
abstract contract AccessControlBase is AccessControlRead {
    /// @inheritdoc IAccessControl
    function initializeAccessControl()
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyFacetNotRegistered(RESOLVER_KEY_ACCESS_CONTROL)
    {
        InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_ACCESS_CONTROL);
        emit IAccessControl.AccessControlInitialized();
    }

    /**
     * @notice Grants `_role` to `_account`.
     * @dev Reverts with `AccountAssignedToRole` if the account already holds the role.
     *      Emits `RoleGranted`. Callers must apply their own admin-role and lifecycle guards.
     * @param _role The role identifier to grant.
     * @param _account The account to receive the role.
     * @return success_ True if the role was successfully granted.
     */
    function _grantRole(bytes32 _role, address _account) internal returns (bool success_) {
        if (!AccessControlStorageWrapper.grantRole(_role, _account)) {
            revert AccountAssignedToRole(_role, _account);
        }
        emit RoleGranted(EvmAccessors.getMsgSender(), _account, _role);
        return true;
    }

    /**
     * @notice Revokes `_role` from `_account`.
     * @dev Reverts with `AccountNotAssignedToRole` if the account does not hold the role.
     *      Emits `RoleRevoked`. Callers must apply their own admin-role and lifecycle guards.
     * @param _role The role identifier to revoke.
     * @param _account The account to lose the role.
     * @return success_ True if the role was successfully revoked.
     */
    function _revokeRole(bytes32 _role, address _account) internal returns (bool success_) {
        success_ = AccessControlStorageWrapper.revokeRole(_role, _account);
        if (!success_) {
            revert AccountNotAssignedToRole(_role, _account);
        }
        emit RoleRevoked(EvmAccessors.getMsgSender(), _account, _role);
    }

    /**
     * @notice Renounces `_role` on behalf of the caller.
     * @dev Reverts with `CannotRenounceSoleAdmin` if the caller is the sole `DEFAULT_ADMIN_ROLE`
     *      holder, or `AccountNotAssignedToRole` if the caller does not hold the role. Emits
     *      `RoleRenounced`. Callers must apply their own lifecycle guards.
     * @param _role The role identifier to renounce.
     * @return success_ True if the role was successfully renounced.
     */
    function _renounceRole(bytes32 _role) internal returns (bool success_) {
        address account = EvmAccessors.getMsgSender();
        success_ = AccessControlStorageWrapper.revokeRole(_role, account);
        if (!success_) {
            revert AccountNotAssignedToRole(_role, account);
        }
        emit RoleRenounced(account, _role);
    }

    /**
     * @notice Applies multiple role grants or revocations to `_account` in a single call.
     * @dev Per-role admin checks are enforced inside the storage layer. Emits `RolesApplied`
     *      with the requested entries and `EffectivelyRolesApplied` with the subset that
     *      effectively changed state. Callers must apply their own lifecycle guards and
     *      array-consistency checks.
     * @param _roles Array of role identifiers to process.
     * @param _actives Corresponding flags; `true` grants the role, `false` revokes it.
     * @param _account The account to which roles are applied.
     */
    function _applyRoles(bytes32[] calldata _roles, bool[] calldata _actives, address _account) internal {
        (bytes32[] memory appliedRoles, bool[] memory appliedStates) = AccessControlStorageWrapper.applyRoles(
            _roles,
            _actives,
            _account
        );
        emit RolesApplied(_roles, _actives, _account);
        emit EffectivelyRolesApplied(appliedRoles, appliedStates);
    }
}
