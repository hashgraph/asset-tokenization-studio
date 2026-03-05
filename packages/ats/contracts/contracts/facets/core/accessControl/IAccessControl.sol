// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

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
     * @dev Emitted when a default admin role is replaced
     *
     * @param role The role that replace its administrative role.
     * @param previousAdminRole The legacy administrative role.
     * @param newAdminRole The new administrative role.
     */
    event RoleAdminChanged(bytes32 indexed role, bytes32 indexed previousAdminRole, bytes32 indexed newAdminRole);

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
     * @dev Emitted when a set of roles are applied to an account
     *
     * @param roles The roles that was applied
     * @param actives By each role, true if the role is granted, false if revoked
     * @param account The account that renouced to the role
     */
    event RolesApplied(bytes32[] roles, bool[] actives, address account);

    /**
     * @dev Emitted when the provided account is not granted the role
     *
     * @param account The account for which the role is checked for granted
     * @param role The role that is checked to see if the account has been granted
     *
     */
    error AccountHasNoRole(address account, bytes32 role);

    /**
     * @dev Emitted when the provided account is not granted any of the roles
     *
     * @param account The account for which the role is checked for granted
     * @param roles The roles that are checked to see if the account has been granted
     *
     */
    error AccountHasNoRoles(address account, bytes32[] roles);

    /**
     * @dev Emitted when the roles length and actives length are not the same
     *
     * @param rolesLength The length of roles array
     * @param activesLength The length of actives array
     */
    error RolesAndActivesLengthMismatch(uint256 rolesLength, uint256 activesLength);

    error AccountAssignedToRole(bytes32 role, address account);
    error AccountNotAssignedToRole(bytes32 role, address account);
    error RolesNotApplied(bytes32[] roles, bool[] actives, address account);

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
     * @dev Apply roles to an account
     *
     * @param _roles The role id array
     * @param _actives By each role, true if the role is granted, false if revoked
     * @param _account The account address
     * @return success_ true or false
     */
    function applyRoles(
        bytes32[] calldata _roles,
        bool[] calldata _actives,
        address _account
    ) external returns (bool success_);

    /**
     * @dev Returns the number of roles the account currently has
     *
     * @param _account The account address
     * @return roleCount_ The number of roles
     */
    function getRoleCountFor(address _account) external view returns (uint256 roleCount_);

    /**
     * @dev Returns an array of roles the account currently has
     *
     * @param _account The account address
     * @param _pageIndex members to skip : _pageIndex * _pageLength
     * @param _pageLength number of members to return
     * @return roles_ The array containing the roles
     */
    function getRolesFor(
        address _account,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (bytes32[] memory roles_);

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
