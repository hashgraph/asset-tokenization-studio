// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IAccessControl } from "./IAccessControl.sol";
import { AccessControlBase } from "./AccessControlBase.sol";
import { AccessControlStorageWrapper } from "../../domain/core/AccessControlStorageWrapper.sol";

/**
 * @title AccessControl
 * @author Asset Tokenization Studio Team
 * @notice Entry point for role-based access control for direct-inheritance consumers that do
 *         not operate through the ResolverProxy pattern (e.g. `DiamondCutManager`). Supports
 *         individual and batch role mutations as well as paginated role queries (inherited).
 * @dev Thin wrapper over `AccessControlBase`: declares the guard modifiers appropriate to a
 *      non-proxy consumer and delegates the actual storage mutation and event emission to the
 *      shared internal helpers. Use `AccessControlOperational` (with `onlyOperational`) for
 *      proxy facets instead.
 */
abstract contract AccessControl is AccessControlBase {
    /// @inheritdoc IAccessControl
    /// @dev Requires the token to be unpaused and the caller to hold the admin role of `_role`.
    function grantRole(
        bytes32 _role,
        address _account
    ) external override onlyUnpaused onlyRole(AccessControlStorageWrapper.getRoleAdmin(_role)) returns (bool success_) {
        return _grantRole(_role, _account);
    }

    /// @inheritdoc IAccessControl
    /// @dev Requires the token to be unpaused and the caller to hold the admin role of `_role`.
    function revokeRole(
        bytes32 _role,
        address _account
    ) external override onlyUnpaused onlyRole(AccessControlStorageWrapper.getRoleAdmin(_role)) returns (bool success_) {
        return _revokeRole(_role, _account);
    }

    /// @inheritdoc IAccessControl
    /// @dev Requires the token to be unpaused. No admin role required; acts on `msg.sender`.
    ///      Reverts with `CannotRenounceSoleAdmin` if the caller is the sole DEFAULT_ADMIN_ROLE holder.
    function renounceRole(bytes32 _role) external override onlyUnpaused returns (bool success_) {
        return _renounceRole(_role);
    }

    /// @inheritdoc IAccessControl
    /// @dev Requires the token to be unpaused, equal-length arrays, and no duplicate role
    ///      entries. Per-role admin checks are enforced inside the storage layer.
    function applyRoles(
        bytes32[] calldata _roles,
        bool[] calldata _actives,
        address _account
    )
        external
        override
        onlyUnpaused
        onlySameRolesAndActivesLength(_roles.length, _actives.length)
        onlyConsistentRoles(_roles, _actives)
    {
        _applyRoles(_roles, _actives, _account);
    }
}
