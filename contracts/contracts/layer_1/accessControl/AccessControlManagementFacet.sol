// SPDX-License-Identifier: BSD-3-Clause-Attribution
pragma solidity 0.8.18;

import {
    AccessControlStorageWrapper2
} from '../../layer_0/core/accessControl/AccessControlStorageWrapper2.sol';
import {
    _ACCESS_CONTROL_MANAGEMENT_RESOLVER_KEY
} from '../constants/resolverKeys.sol';
import {
    IStaticFunctionSelectors
} from '../../interfaces/resolver/resolverProxy/IStaticFunctionSelectors.sol';

/**
 * @title AccessControlManagementFacet
 * @dev Diamond pattern facet for access control management operations
 * (grant, revoke, apply roles)
 */
contract AccessControlManagementFacet is
    IStaticFunctionSelectors,
    AccessControlStorageWrapper2
{
    /**
     * @dev Emitted when a role is granted to an account
     */
    event RoleGranted(
        address indexed operator,
        address indexed account,
        bytes32 indexed role
    );

    /**
     * @dev Emitted when a role is revoked from an account
     */
    event RoleRevoked(
        address indexed operator,
        address indexed account,
        bytes32 indexed role
    );

    /**
     * @dev Emitted when a role is renounced by an account
     */
    event RoleRenounced(address indexed account, bytes32 indexed role);

    /**
     * @dev Emitted when a set of roles are applied to an account
     */
    event RolesApplied(bytes32[] roles, bool[] actives, address account);

    error AccountAssignedToRole(bytes32 role, address account);
    error AccountNotAssignedToRole(bytes32 role, address account);
    error RolesNotApplied(bytes32[] roles, bool[] actives, address account);

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

    function getStaticResolverKey()
        external
        pure
        override
        returns (bytes32 staticResolverKey_)
    {
        staticResolverKey_ = _ACCESS_CONTROL_MANAGEMENT_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors()
        external
        pure
        override
        returns (bytes4[] memory staticFunctionSelectors_)
    {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](4);
        staticFunctionSelectors_[selectorIndex++] = this.grantRole.selector;
        staticFunctionSelectors_[selectorIndex++] = this.revokeRole.selector;
        staticFunctionSelectors_[selectorIndex++] = this.renounceRole.selector;
        staticFunctionSelectors_[selectorIndex++] = this.applyRoles.selector;
    }

    function getStaticInterfaceIds()
        external
        pure
        override
        returns (bytes4[] memory staticInterfaceIds_)
    {
        staticInterfaceIds_ = new bytes4[](0);
    }
}
