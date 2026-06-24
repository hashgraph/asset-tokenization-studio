// SPDX-License-Identifier: Apache-2.0
// AUTO-GENERATED — DO NOT EDIT.
// Source: contracts/facets/accessControl/IAccessControl.sol
// Regenerated on every `npx hardhat compile` by the
// `erc3643-clone-interfaces` task in `tasks/compile.ts`.
// Edits to this file will be silently overwritten.
pragma solidity ^0.8.17;

/// @custom:hash resolverKey AccessControl
bytes32 constant RESOLVER_KEY_ACCESS_CONTROL = 0xccc2e755f9225e65f6c822a258c866fc0d57a124ad12c8928adf3ff875ffcd70;

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
interface TRexIAccessControl {
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
     * @notice Emitted when multiple role operations are requested for an account.
     * @dev `roles` and `actives` are parallel arrays and must have the same length.
     *      Entries represent the requested role state changes, not necessarily only
     *      the effective storage mutations.
     * @param roles The roles processed by the batch operation.
     * @param actives The requested state for each role; `true` grants and `false` revokes.
     * @param account The account for which the role operations are requested.
     */
    event RolesApplied(bytes32[] roles, bool[] actives, address account);

    /**
     * @notice Emitted when one or more role changes are effectively applied.
     * @dev `roles` and `actives` are parallel arrays containing the role states that
     *      resulted in effective storage mutations.
     * @param roles The roles whose assigned state changed.
     * @param actives The effective state applied to each role; `true` granted and
     *        `false` revoked.
     */
    event EffectivelyRolesApplied(bytes32[] roles, bool[] actives);
    /**
     * @notice Emitted once when the AccessControl capability is initialised on a token.
     * @dev Fires exclusively from `initializeAccessControl` after the registration succeeds.
     */
    event AccessControlInitialized();

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
     * @notice Thrown when the sole holder of `DEFAULT_ADMIN_ROLE` attempts to renounce it,
     *         which would permanently lock all admin-gated functions.
     */
    error CannotRenounceSoleAdmin();

    /**
     * @notice Initialises the AccessControl capability on the token.
     * @dev Callable once; subsequent calls revert with `FacetAlreadyRegistered`.
     *      Requires `DEFAULT_ADMIN_ROLE`. Called by the factory during deployment.
     */
    function initializeAccessControl() external;

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
     *      revoke entries where it does not are silently skipped. Emits `RolesApplied` with the
     *      subset that effectively changed state.
     * @param _roles Array of role identifiers to process.
     * @param _actives Corresponding flags; `true` grants the role, `false` revokes it.
     * @param _account The account to which roles are applied.
     */
    function applyRoles(bytes32[] calldata _roles, bool[] calldata _actives, address _account) external;

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
