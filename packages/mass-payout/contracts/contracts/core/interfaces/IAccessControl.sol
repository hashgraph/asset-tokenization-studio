// SPDX-License-Identifier: Apache-2.0

pragma solidity 0.8.22;

// SPDX-License-Identifier: BSD-3-Clause-Attribution

interface IAccessControl {
    /**
     * @dev Emitted when a role is granted to an account
     *
     * @param role The role to be granted
     * @param account The account for which the role is to be granted
     * @param operator The caller of the function that emitted the event
     */
    event RoleGranted(address indexed operator, address indexed account, bytes32 indexed role);

    /**
     * @dev Emitted when a role is revoked from an account
     *
     * @param role The role to be revoked
     * @param account The account for which the role is to be revoked
     * @param operator The caller of the function that emitted the event
     */
    event RoleRevoked(address indexed operator, address indexed account, bytes32 indexed role);

    /**
     * @dev Emitted when a role is renounced by an account
     *
     * @param role The role that was renounced
     * @param account The account that renouced to the role
     */
    event RoleRenounced(address indexed account, bytes32 indexed role);

    /**
     * @dev Emitted when trying to grant a role to an account that was already assigned
     *
     * @param role The role that was already assigned to the account
     * @param account The account that the role was already assigned to
     */
    error AccountAssignedToRole(bytes32 role, address account);

    /**
     * @dev Emitted when trying to revoke/renounce a role and the role wasn't assigned to the account
     *
     * @param role The role that wasn't assigned to the account
     * @param account The account that the role wasn't assigned to
     */
    error AccountNotAssignedToRole(bytes32 role, address account);

    /**
     * @dev Grants a role
     *
     * @param _role The role id
     * @param _account The account address
     * @return success_ true or false
     */
    function grantRole(bytes32 _role, address _account) external returns (bool success_);

    /**
     * @dev Revokes a role
     *
     * @param _role The role id
     * @param _account The account address
     * @return success_ true or false
     */
    function revokeRole(bytes32 _role, address _account) external returns (bool success_);

    /**
     * @dev Renounces a role
     *
     * @param _role The role id
     * @return success_ true or false
     */
    function renounceRole(bytes32 _role) external returns (bool success_);

    /**
     * @dev Returns the number of roles the account currently has
     *
     * @param _account The account address
     * @return roleCount_ The number of roles
     */
    function getRoleCountFor(address _account) external view returns (uint256 roleCount_);

    /**
     * @dev Returns the number of members the role currently has
     *
     * @param _role The role id
     * @return memberCount_ The number of members
     */
    function getRoleMemberCount(bytes32 _role) external view returns (uint256 memberCount_);

    /**
     * @dev Returns an array of members the role currently has
     *
     * @param _role The role id
     * @param _pageIndex members to skip : _pageIndex * _pageLength
     * @param _pageLength number of members to return
     * @return members_ The array containing the members addresses
     */
    function getRoleMembers(
        bytes32 _role,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (address[] memory members_);

    /**
     * @dev Checks if an account has a role
     *
     * @param _role The role id
     * @param _account the account address
     * @return bool true or false
     */
    function hasRole(bytes32 _role, address _account) external view returns (bool);
}
