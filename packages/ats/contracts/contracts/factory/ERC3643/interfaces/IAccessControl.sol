// SPDX-License-Identifier: Apache-2.0
// AUTO-GENERATED — DO NOT EDIT.
// Source: contracts/facets/accessControl/IAccessControl.sol
// Regenerated on every `npx hardhat compile` by the
// `erc3643-clone-interfaces` task in `tasks/compile.ts`.
// Edits to this file will be silently overwritten.
pragma solidity ^0.8.17;

/**
 * @title IAccessControl
 * @notice Interface for role-based access control management,
 *         including grant, revoke, renounce, and query operations.
 * @dev Defines the standard for managing role assignments with
 *      paginated retrieval of role members and account roles.
 *      Supports bulk role application via applyRoles.
 * @author Asset Tokenization Studio Team
 */
interface TRexIAccessControl {
    /**
     * @notice Emitted when the administrative role for a given
     *         role is changed.
     * @param role The role whose admin role was changed
     * @param previousAdminRole The previous admin role for the
     *         role
     * @param newAdminRole The new admin role for the role
     */
    event RoleAdminChanged(bytes32 indexed role, bytes32 indexed previousAdminRole, bytes32 indexed newAdminRole);

    /**
     * @notice Emitted when a role is granted to an account.
     * @param operator The address that performed the grant
     *         operation
     * @param account The account that received the role
     * @param role The role that was granted
     */
    event RoleGranted(address indexed operator, address indexed account, bytes32 indexed role);

    /**
     * @notice Emitted when a role is revoked from an account.
     * @param operator The address that performed the revoke
     *         operation
     * @param account The account from which the role was revoked
     * @param role The role that was revoked
     */
    event RoleRevoked(address indexed operator, address indexed account, bytes32 indexed role);

    /**
     * @notice Emitted when an account voluntarily renounces a
     *         role.
     * @param account The account that renounced the role
     * @param role The role that was renounced
     */
    event RoleRenounced(address indexed account, bytes32 indexed role);

    /**
     * @notice Emitted when multiple roles are applied to an
     *         account in a single operation.
     * @param roles The roles that were applied
     * @param actives Whether each corresponding role was granted
     *         (true) or revoked (false)
     * @param account The account to which the roles were applied
     */
    event RolesApplied(bytes32[] roles, bool[] actives, address account);

    /**
     * @notice Triggered when an account does not hold a required
     *         role.
     * @param account The account that lacks the role
     * @param role The role that is not held
     */
    error AccountHasNoRole(address account, bytes32 role);

    /**
     * @notice Triggered when an account does not hold any of the
     *         specified roles.
     * @param account The account that lacks the roles
     * @param roles The roles that are not held
     */
    error AccountHasNoRoles(address account, bytes32[] roles);

    /**
     * @notice Triggered when the roles array and actives array
     *         lengths differ.
     * @param rolesLength Length of the roles array
     * @param activesLength Length of the actives array
     */
    error RolesAndActivesLengthMismatch(uint256 rolesLength, uint256 activesLength);

    /**
     * @notice Triggered when an account is already assigned to a
     *         role that cannot be duplicated.
     * @param role The role to which the account is already
     *         assigned
     * @param account The account already holding the role
     */
    error AccountAssignedToRole(bytes32 role, address account);

    /**
     * @notice Triggered when an account is not assigned to a
     *         role that is required to be held before the
     *         operation.
     * @param role The role to which the account is not assigned
     * @param account The account not holding the role
     */
    error AccountNotAssignedToRole(bytes32 role, address account);

    /**
     * @notice Triggered when a bulk role application fails to
     *         persist all requested changes.
     * @param roles The roles that were attempted to be applied
     * @param actives The grant/revoke flags that were attempted
     * @param account The account targeted by the role
     *         application
     */
    error RolesNotApplied(bytes32[] roles, bool[] actives, address account);

    /**
     * @notice Grants a role to an account.
     * @dev The caller must be authorised to grant the specified
     *      role. Emits a RoleGranted event on success.
     * @param _role The role identifier to grant
     * @param _account The account to receive the role
     * @return success_ Whether the grant operation succeeded
     */
    function grantRole(bytes32 _role, address _account) external returns (bool success_);

    /**
     * @notice Revokes a role from an account.
     * @dev The caller must be authorised to revoke the specified
     *      role. Emits a RoleRevoked event on success.
     * @param _role The role identifier to revoke
     * @param _account The account to lose the role
     * @return success_ Whether the revoke operation succeeded
     */
    function revokeRole(bytes32 _role, address _account) external returns (bool success_);

    /**
     * @notice Allows the caller to renounce a role held by
     *         their own account.
     * @dev Emits a RoleRenounced event on success.
     * @param _role The role identifier to renounce
     * @return success_ Whether the renounce operation succeeded
     */
    function renounceRole(bytes32 _role) external returns (bool success_);

    /**
     * @notice Applies multiple role grants or revocations to an
     *         account in a single transaction.
     * @dev The roles and actives arrays must have equal length.
     *      Emits a RolesApplied event on success.
     * @param _roles Array of role identifiers to apply
     * @param _actives Array of flags; true to grant, false to
     *         revoke, each corresponding to the role at the same
     *         index in _roles
     * @param _account The account to which roles are applied
     * @return success_ Whether the apply operation succeeded
     */
    function applyRoles(
        bytes32[] calldata _roles,
        bool[] calldata _actives,
        address _account
    ) external returns (bool success_);

    /**
     * @notice Returns the number of roles currently assigned to
     *         an account.
     * @param _account The account to query
     * @return roleCount_ The number of roles held by the account
     */
    function getRoleCountFor(address _account) external view returns (uint256 roleCount_);

    /**
     * @notice Returns a paginated list of roles assigned to an
     *         account.
     * @dev Pagination skips _pageIndex * _pageLength entries.
     * @param _account The account to query
     * @param _pageIndex Zero-based page index for pagination
     * @param _pageLength Number of roles to return per page
     * @return roles_ The array of role identifiers for the page
     */
    function getRolesFor(
        address _account,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (bytes32[] memory roles_);

    /**
     * @notice Returns the number of accounts currently holding a
     *         role.
     * @param _role The role identifier to query
     * @return memberCount_ The number of accounts with the role
     */
    function getRoleMemberCount(bytes32 _role) external view returns (uint256 memberCount_);

    /**
     * @notice Returns a paginated list of accounts holding a
     *         role.
     * @dev Pagination skips _pageIndex * _pageLength entries.
     * @param _role The role identifier to query
     * @param _pageIndex Zero-based page index for pagination
     * @param _pageLength Number of members to return per page
     * @return members_ The array of account addresses for the
     *         page
     */
    function getRoleMembers(
        bytes32 _role,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (address[] memory members_);

    /**
     * @notice Checks whether an account holds a specific role.
     * @param _role The role identifier to check
     * @param _account The account to check
     * @return Whether the account holds the specified role
     */
    function hasRole(bytes32 _role, address _account) external view returns (bool);
}
