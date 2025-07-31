// SPDX-License-Identifier: BSD-3-Clause-Attribution
pragma solidity 0.8.18;

import {
    IAccessControlManagement
} from '../interfaces/accessControl/IAccessControlManagement.sol';
import {
    AccessControlStorageWrapper
} from '../../layer_0/core/accessControl/AccessControlStorageWrapper.sol';

/**
 * @title AccessControlManagement
 * @dev Diamond pattern facet for access control management operations
 */
contract AccessControlManagement is
    IAccessControlManagement,
    AccessControlStorageWrapper
{
    function grantRole(
        bytes32 _role,
        address _account
    ) external onlyRole(_getRoleAdmin(_role)) returns (bool success_) {
        if (_hasRole(_role, _account)) {
            revert AccountAssignedToRole(_role, _account);
        }
        success_ = _grantRole(_role, _account);
        emit RoleGranted(_msgSender(), _account, _role);
    }

    function revokeRole(
        bytes32 _role,
        address _account
    ) external onlyRole(_getRoleAdmin(_role)) returns (bool success_) {
        if (!_hasRole(_role, _account)) {
            revert AccountNotAssignedToRole(_role, _account);
        }
        success_ = _revokeRole(_role, _account);
        emit RoleRevoked(_msgSender(), _account, _role);
    }

    function renounceRole(bytes32 _role) external returns (bool success_) {
        address sender = _msgSender();
        if (!_hasRole(_role, sender)) {
            revert AccountNotAssignedToRole(_role, sender);
        }
        success_ = _revokeRole(_role, sender);
        emit RoleRenounced(sender, _role);
    }

    function applyRoles(
        bytes32[] calldata _roles,
        bool[] calldata _actives,
        address _account
    )
        external
        onlySameRolesAndActivesLength(_roles.length, _actives.length)
        onlyConsistentRoles(_roles, _actives)
        returns (bool success_)
    {
        success_ = _applyRoles(_roles, _actives, _account);
        if (!success_) {
            revert RolesNotApplied(_roles, _actives, _account);
        }
        emit RolesApplied(_roles, _actives, _account);
    }
}
