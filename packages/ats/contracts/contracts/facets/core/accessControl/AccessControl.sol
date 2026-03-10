// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IAccessControl } from "../accessControl/IAccessControl.sol";
import { AccessStorageWrapper } from "../../../domain/core/AccessStorageWrapper.sol";
import { PauseStorageWrapper } from "../../../domain/core/PauseStorageWrapper.sol";
import { ArrayValidation } from "../../../infrastructure/utils/ArrayValidation.sol";

abstract contract AccessControl is IAccessControl {
    function grantRole(bytes32 _role, address _account) external override returns (bool success_) {
        AccessStorageWrapper.checkRole(AccessStorageWrapper.getRoleAdmin(_role));
        PauseStorageWrapper.requireNotPaused();

        if (!AccessStorageWrapper.grantRole(_role, _account)) {
            revert AccountAssignedToRole(_role, _account);
        }
        emit RoleGranted(msg.sender, _account, _role);
        return true;
    }

    function revokeRole(bytes32 _role, address _account) external override returns (bool success_) {
        AccessStorageWrapper.checkRole(AccessStorageWrapper.getRoleAdmin(_role));
        PauseStorageWrapper.requireNotPaused();

        success_ = AccessStorageWrapper.revokeRole(_role, _account);
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
        AccessStorageWrapper.checkSameRolesAndActivesLength(_roles.length, _actives.length);
        ArrayValidation.checkUniqueValues(_roles, _actives);

        success_ = AccessStorageWrapper.applyRoles(_roles, _actives, _account);
        if (!success_) {
            revert RolesNotApplied(_roles, _actives, _account);
        }
        emit RolesApplied(_roles, _actives, _account);
    }

    function renounceRole(bytes32 _role) external override returns (bool success_) {
        PauseStorageWrapper.requireNotPaused();

        address account = msg.sender;
        success_ = AccessStorageWrapper.revokeRole(_role, account);
        if (!success_) {
            revert AccountNotAssignedToRole(_role, account);
        }
        emit RoleRenounced(account, _role);
    }

    function hasRole(bytes32 _role, address _account) external view override returns (bool) {
        return AccessStorageWrapper.hasRole(_role, _account);
    }

    function getRoleCountFor(address _account) external view override returns (uint256 roleCount_) {
        roleCount_ = AccessStorageWrapper.getRoleCountFor(_account);
    }

    function getRolesFor(
        address _account,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (bytes32[] memory roles_) {
        roles_ = AccessStorageWrapper.getRolesFor(_account, _pageIndex, _pageLength);
    }

    function getRoleMemberCount(bytes32 _role) external view override returns (uint256 memberCount_) {
        memberCount_ = AccessStorageWrapper.getRoleMemberCount(_role);
    }

    function getRoleMembers(
        bytes32 _role,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (address[] memory members_) {
        members_ = AccessStorageWrapper.getRoleMembers(_role, _pageIndex, _pageLength);
    }
}
