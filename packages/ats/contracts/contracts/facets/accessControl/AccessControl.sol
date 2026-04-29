// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IAccessControl } from "./IAccessControl.sol";
import { AccessControlStorageWrapper } from "../../domain/core/AccessControlStorageWrapper.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";

/**
 * @title AccessControl
 * @author Asset Tokenization Studio Team
 * @notice Abstract contract implementing role-based access control for a security token.
 *         Supports individual and batch role mutations as well as paginated role queries.
 * @dev Implements `IAccessControl`. All state is delegated to `AccessControlStorageWrapper`.
 *      All mutating functions additionally require the token to be unpaused (`onlyUnpaused`).
 *      `grantRole` and `revokeRole` resolve the required admin role dynamically via
 *      `AccessControlStorageWrapper.getRoleAdmin`. `applyRoles` enforces per-role admin checks
 *      inside the storage layer. Intended to be inherited exclusively by `AccessControlFacet`.
 */
abstract contract AccessControl is IAccessControl, Modifiers {
    /// @inheritdoc IAccessControl
    /// @dev Requires the token to be unpaused and the caller to hold the admin role of `_role`.
    function grantRole(
        bytes32 _role,
        address _account
    ) external override onlyUnpaused onlyRole(AccessControlStorageWrapper.getRoleAdmin(_role)) returns (bool success_) {
        if (!AccessControlStorageWrapper.grantRole(_role, _account)) {
            revert AccountAssignedToRole(_role, _account);
        }
        emit RoleGranted(EvmAccessors.getMsgSender(), _account, _role);
        return true;
    }

    /// @inheritdoc IAccessControl
    /// @dev Requires the token to be unpaused and the caller to hold the admin role of `_role`.
    function revokeRole(
        bytes32 _role,
        address _account
    ) external override onlyUnpaused onlyRole(AccessControlStorageWrapper.getRoleAdmin(_role)) returns (bool success_) {
        success_ = AccessControlStorageWrapper.revokeRole(_role, _account);
        if (!success_) {
            revert AccountNotAssignedToRole(_role, _account);
        }
        emit RoleRevoked(EvmAccessors.getMsgSender(), _account, _role);
    }

    /// @inheritdoc IAccessControl
    /// @dev Requires the token to be unpaused. No admin role required; acts on `msg.sender`.
    function renounceRole(bytes32 _role) external override onlyUnpaused returns (bool success_) {
        address account = EvmAccessors.getMsgSender();
        success_ = AccessControlStorageWrapper.revokeRole(_role, account);
        if (!success_) {
            revert AccountNotAssignedToRole(_role, account);
        }
        emit RoleRenounced(account, _role);
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
        returns (bool success_)
    {
        success_ = AccessControlStorageWrapper.applyRoles(_roles, _actives, _account);
        if (!success_) {
            revert RolesNotApplied(_roles, _actives, _account);
        }
        emit RolesApplied(_roles, _actives, _account);
    }

    /// @inheritdoc IAccessControl
    function hasRole(bytes32 _role, address _account) external view override returns (bool) {
        return AccessControlStorageWrapper.hasRole(_role, _account);
    }

    /// @inheritdoc IAccessControl
    function getRoleCountFor(address _account) external view override returns (uint256 roleCount_) {
        roleCount_ = AccessControlStorageWrapper.getRoleCountFor(_account);
    }

    /// @inheritdoc IAccessControl
    function getRolesFor(
        address _account,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (bytes32[] memory roles_) {
        roles_ = AccessControlStorageWrapper.getRolesFor(_account, _pageIndex, _pageLength);
    }

    /// @inheritdoc IAccessControl
    function getRoleMemberCount(bytes32 _role) external view override returns (uint256 memberCount_) {
        memberCount_ = AccessControlStorageWrapper.getRoleMemberCount(_role);
    }

    /// @inheritdoc IAccessControl
    function getRoleMembers(
        bytes32 _role,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (address[] memory members_) {
        members_ = AccessControlStorageWrapper.getRoleMembers(_role, _pageIndex, _pageLength);
    }
}
