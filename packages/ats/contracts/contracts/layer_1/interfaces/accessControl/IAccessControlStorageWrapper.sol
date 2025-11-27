// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

interface IAccessControlStorageWrapper {
    /**
     * @dev Emitted when a default admin role is replaced
     *
     * @param role The role that replace its administrative role.
     * @param previousAdminRole The legacy administrative role.
     * @param newAdminRole The new administrative role.
     */
    event RoleAdminChanged(bytes32 indexed role, bytes32 indexed previousAdminRole, bytes32 indexed newAdminRole);

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
}
