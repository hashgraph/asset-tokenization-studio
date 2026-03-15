// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IAccessControl } from "./IAccessControl.sol";
import { AccessControlStorageWrapper } from "../../../domain/core/AccessControlStorageWrapper.sol";
import { PauseStorageWrapper } from "../../../domain/core/PauseStorageWrapper.sol";

abstract contract AccessControl is IAccessControl {
    function grantRole(bytes32 _role, address _account) external override returns (bool success_) {
        AccessControlStorageWrapper.checkRole(AccessControlStorageWrapper.getRoleAdmin(_role), msg.sender);
        PauseStorageWrapper.requireNotPaused();
        if (!AccessControlStorageWrapper.grantRole(_role, _account)) {
            revert AccountAssignedToRole(_role, _account);
        }
        emit RoleGranted(msg.sender, _account, _role);
        return true;
    }

    function revokeRole(bytes32 _role, address _account) external override returns (bool success_) {
        AccessControlStorageWrapper.checkRole(AccessControlStorageWrapper.getRoleAdmin(_role), msg.sender);
        PauseStorageWrapper.requireNotPaused();
        success_ = AccessControlStorageWrapper.revokeRole(_role, _account);
        if (!success_) {
            revert AccountNotAssignedToRole(_role, _account);
        }
        emit RoleRevoked(msg.sender, _account, _role);
    }

    function applyRoles(
        bytes32[] calldata _roles,
        bool[] calldata _actives,
        address _account
    ) external override returns (bool success_) {
        PauseStorageWrapper.requireNotPaused();
        AccessControlStorageWrapper.checkSameRolesAndActivesLength(_roles.length, _actives.length);
        AccessControlStorageWrapper.checkConsistentRoles(_roles, _actives);
        success_ = AccessControlStorageWrapper.applyRoles(_roles, _actives, _account);
        if (!success_) {
            revert RolesNotApplied(_roles, _actives, _account);
        }
        emit RolesApplied(_roles, _actives, _account);
    }

    function renounceRole(bytes32 _role) external override returns (bool success_) {
        address account = msg.sender;
        PauseStorageWrapper.requireNotPaused();
        success_ = AccessControlStorageWrapper.revokeRole(_role, account);
        if (!success_) {
            revert AccountNotAssignedToRole(_role, account);
        }
        emit RoleRenounced(account, _role);
    }

    function hasRole(bytes32 _role, address _account) external view override returns (bool) {
        return AccessControlStorageWrapper.hasRole(_role, _account);
    }

    function getRoleCountFor(address _account) external view override returns (uint256 roleCount_) {
        roleCount_ = AccessControlStorageWrapper.getRoleCountFor(_account);
    }

    function getRolesFor(
        address _account,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (bytes32[] memory roles_) {
        roles_ = AccessControlStorageWrapper.getRolesFor(_account, _pageIndex, _pageLength);
    }

    function getRoleMemberCount(bytes32 _role) external view override returns (uint256 memberCount_) {
        memberCount_ = AccessControlStorageWrapper.getRoleMemberCount(_role);
    }

    function getRoleMembers(
        bytes32 _role,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (address[] memory members_) {
        members_ = AccessControlStorageWrapper.getRoleMembers(_role, _pageIndex, _pageLength);
    }
}
