// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IAccessControl } from "./IAccessControl.sol";
import { AccessControlBase } from "./AccessControlBase.sol";
import { AccessControlStorageWrapper } from "../../domain/core/AccessControlStorageWrapper.sol";

/**
 * @title AccessControlOperational
 * @author Asset Tokenization Studio Team
 * @notice Entry point for role-based access control for proxy facets. Identical to
 *         `AccessControl` except every state-changing function additionally requires
 *         `onlyOperational` as its first modifier. Use `AccessControl` (without
 *         `onlyOperational`) for direct-inheritance consumers such as `DiamondCutManager`
 *         that do not operate through the ResolverProxy pattern.
 * @dev Thin wrapper over `AccessControlBase`: declares the guard modifiers appropriate to a
 *      proxy facet and delegates the actual storage mutation and event emission to the shared
 *      internal helpers. Intended to be inherited exclusively by `AccessControlFacet`.
 */
abstract contract AccessControlOperational is AccessControlBase {
    /// @inheritdoc IAccessControl
    /// @dev Requires the token to be operational and unpaused, and the caller to hold the admin role of `_role`.
    function grantRole(
        bytes32 _role,
        address _account
    )
        external
        override
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlyRole(AccessControlStorageWrapper.getRoleAdmin(_role))
        returns (bool success_)
    {
        return _grantRole(_role, _account);
    }

    /// @inheritdoc IAccessControl
    /// @dev Requires the token to be operational and unpaused, and the caller to hold the admin role of `_role`.
    function revokeRole(
        bytes32 _role,
        address _account
    )
        external
        override
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlyRole(AccessControlStorageWrapper.getRoleAdmin(_role))
        returns (bool success_)
    {
        return _revokeRole(_role, _account);
    }

    /// @inheritdoc IAccessControl
    /// @dev Requires the token to be operational and unpaused. No admin role required; acts on `msg.sender`.
    ///      Reverts with `CannotRenounceSoleAdmin` if the caller is the sole DEFAULT_ADMIN_ROLE holder.
    function renounceRole(
        bytes32 _role
    ) external override onlyOperational onlyActivated onlyUnpaused returns (bool success_) {
        return _renounceRole(_role);
    }

    /// @inheritdoc IAccessControl
    /// @dev Requires the token to be operational and unpaused, equal-length arrays, and no duplicate role
    ///      entries. Per-role admin checks are enforced inside the storage layer.
    function applyRoles(
        bytes32[] calldata _roles,
        bool[] calldata _actives,
        address _account
    )
        external
        override
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlySameRolesAndActivesLength(_roles.length, _actives.length)
        onlyConsistentRoles(_roles, _actives)
    {
        _applyRoles(_roles, _actives, _account);
    }
}
