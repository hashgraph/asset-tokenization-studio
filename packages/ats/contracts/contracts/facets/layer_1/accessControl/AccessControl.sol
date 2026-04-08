// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IAccessControl } from "./IAccessControl.sol";
import { AccessControlStorageWrapper } from "../../../domain/core/AccessControlStorageWrapper.sol";
import { Modifiers } from "../../../services/Modifiers.sol";
import { EvmAccessors } from "../../../infrastructure/utils/EvmAccessors.sol";

abstract contract AccessControl is IAccessControl, Modifiers {
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

    function renounceRole(bytes32 _role) external override onlyUnpaused returns (bool success_) {
        address account = EvmAccessors.getMsgSender();
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
