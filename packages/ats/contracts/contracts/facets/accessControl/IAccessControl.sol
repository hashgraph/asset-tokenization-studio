// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title IAccessControl
 * @author Asset Tokenization Studio Team
 * @notice Interface for role-based access control on a security token. Supports granting,
 *         revoking, and renouncing roles, batch application via `applyRoles`, and paginated
 *         queries for role members and account roles.
 * @dev Part of the Diamond facet system. Role state is stored via
 *      `AccessControlStorageWrapper`. Each role has an admin role; only accounts holding a
 *      role's admin role may grant or revoke it. `applyRoles` enforces this per-role in the
 *      storage layer. Role and member sets are backed by `EnumerableSet`, ensuring O(1) membership
 *      checks and deterministic pagination.
 */
interface IAccessControl {
    /**
     * @notice Emitted when the admin role for a given role is changed.
     * @param role The role whose admin role was updated.
     * @param previousAdminRole The previous admin role.
     * @param newAdminRole The new admin role.
     */
    event RoleAdminChanged(bytes32 indexed role, bytes32 indexed previousAdminRole, bytes32 indexed newAdminRole);

    /**
     * @notice Emitted when a role is granted to an account.
     * @param operator The address that performed the grant.
     * @param account The account that received the role.
     * @param role The role that was granted.
     */
    event RoleGranted(address indexed operator, address indexed account, bytes32 indexed role);

    /**
     * @notice Emitted when a role is revoked from an account.
     * @param operator The address that performed the revocation.
     * @param account The account from which the role was revoked.
     * @param role The role that was revoked.
     */
    event RoleRevoked(address indexed operator, address indexed account, bytes32 indexed role);

    /**
     * @notice Emitted when an account voluntarily renounces a role it holds.
     * @param account The account that renounced the role.
     * @param role The role that was renounced.
     */
    event RoleRenounced(address indexed account, bytes32 indexed role);

    /**
     * @notice Emitted when multiple roles are applied to an account in a single operation.
     * @param roles The roles that were processed.
     * @param actives Corresponding grant/revoke flags; `true` means granted, `false` revoked.
     * @param account The account to which the roles were applied.
     */
    event RolesApplied(bytes32[] roles, bool[] actives, address account);

    /**
     * @notice Thrown when an account does not hold a required role.
     * @param account The account that lacks the role.
     * @param role The role that is not held.
     */
    error AccountHasNoRole(address account, bytes32 role);

    /**
     * @notice Thrown when an account does not hold any of the specified roles.
     * @param account The account that lacks the roles.
     * @param roles The roles that are not held.
     */
    error AccountHasNoRoles(address account, bytes32[] roles);

    /**
     * @notice Thrown when the `roles` and `actives` arrays passed to `applyRoles` differ in
     *         length.
     * @param rolesLength Length of the roles array.
     * @param activesLength Length of the actives array.
     */
    error RolesAndActivesLengthMismatch(uint256 rolesLength, uint256 activesLength);

    /**
     * @notice Thrown when attempting to grant a role to an account that already holds it.
     * @param role The role the account already holds.
     * @param account The account already assigned to the role.
     */
    error AccountAssignedToRole(bytes32 role, address account);

    /**
     * @notice Thrown when attempting to revoke or renounce a role from an account that does not
     *         hold it.
     * @param role The role the account does not hold.
     * @param account The account not assigned to the role.
     */
    error AccountNotAssignedToRole(bytes32 role, address account);

    /**
     * @notice Thrown when a batch role application via `applyRoles` fails to persist all
     *         requested changes.
     * @param roles The roles that were attempted.
     * @param actives The corresponding grant/revoke flags that were attempted.
     * @param account The account targeted by the operation.
     */
    error RolesNotApplied(bytes32[] roles, bool[] actives, address account);

    /**
     * @notice Grants a role to an account.
     * @dev The caller must hold the admin role of `_role` (resolved dynamically via
     *      `getRoleAdmin`). Reverts with `AccountAssignedToRole` if the account already holds
     *      the role. Emits `RoleGranted`.
     * @param _role The role identifier to grant.
     * @param _account The account to receive the role.
     * @return success_ True if the role was successfully granted.
     */
    function grantRole(bytes32 _role, address _account) external returns (bool success_);

    /**
     * @notice Revokes a role from an account.
     * @dev The caller must hold the admin role of `_role` (resolved dynamically via
     *      `getRoleAdmin`). Reverts with `AccountNotAssignedToRole` if the account does not hold
     *      the role. Emits `RoleRevoked`.
     * @param _role The role identifier to revoke.
     * @param _account The account to lose the role.
     * @return success_ True if the role was successfully revoked.
     */
    function revokeRole(bytes32 _role, address _account) external returns (bool success_);

    /**
     * @notice Allows the caller to renounce a role held by their own account.
     * @dev Operates on `msg.sender` only; no admin role is required. Reverts with
     *      `AccountNotAssignedToRole` if the caller does not hold the role. Emits
     *      `RoleRenounced`.
     * @param _role The role identifier to renounce.
     * @return success_ True if the role was successfully renounced.
     */
    function renounceRole(bytes32 _role) external returns (bool success_);

    /**
     * @notice Applies multiple role grants or revocations to an account in a single transaction.
     * @dev The caller must hold the admin role for each role in `_roles` (checked per entry in
     *      the storage layer). `_roles` and `_actives` must have equal length and contain no
     *      duplicate role entries. Grant entries where the account already holds the role and
     *      revoke entries where it does not are silently skipped. Emits `RolesApplied`.
     * @param _roles Array of role identifiers to process.
     * @param _actives Corresponding flags; `true` grants the role, `false` revokes it.
     * @param _account The account to which roles are applied.
     * @return success_ True if the batch application completed without error.
     */
    function applyRoles(
        bytes32[] calldata _roles,
        bool[] calldata _actives,
        address _account
    ) external returns (bool success_);

    /**
     * @notice Returns the number of roles currently assigned to an account.
     * @param _account The account to query.
     * @return roleCount_ The number of roles held by `_account`.
     */
    function getRoleCountFor(address _account) external view returns (uint256 roleCount_);

    /**
     * @notice Returns a paginated slice of roles assigned to an account.
     * @dev The list offset is computed as `_pageIndex * _pageLength`. Returns an empty array when
     *      the offset meets or exceeds the role count for the account.
     * @param _account The account to query.
     * @param _pageIndex Zero-based page index.
     * @param _pageLength Maximum number of roles to return per page.
     * @return roles_ Array of role identifiers held by `_account` for the requested page.
     */
    function getRolesFor(
        address _account,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (bytes32[] memory roles_);

    /**
     * @notice Returns the number of accounts currently holding a role.
     * @param _role The role identifier to query.
     * @return memberCount_ The number of accounts assigned to `_role`.
     */
    function getRoleMemberCount(bytes32 _role) external view returns (uint256 memberCount_);

    /**
     * @notice Returns a paginated slice of accounts holding a role.
     * @dev The list offset is computed as `_pageIndex * _pageLength`. Returns an empty array when
     *      the offset meets or exceeds the member count for the role.
     * @param _role The role identifier to query.
     * @param _pageIndex Zero-based page index.
     * @param _pageLength Maximum number of addresses to return per page.
     * @return members_ Array of account addresses holding `_role` for the requested page.
     */
    function getRoleMembers(
        bytes32 _role,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (address[] memory members_);

    /**
     * @notice Checks whether an account holds a specific role.
     * @param _role The role identifier to check.
     * @param _account The account to check.
     * @return True if `_account` holds `_role`, false otherwise.
     */
    function hasRole(bytes32 _role, address _account) external view returns (bool);
}
