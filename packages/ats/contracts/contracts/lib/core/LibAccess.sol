// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { RoleDataStorage, rolesStorage } from "../../storage/CoreStorage.sol";
import { LibPagination } from "../../infrastructure/lib/LibPagination.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { IAccessControl } from "../../facets/features/interfaces/IAccessControl.sol";

/// @title LibAccess
/// @notice Leaf library for role-based access control functionality
/// @dev Extracted from AccessControlStorageWrapper for library-based diamond migration
library LibAccess {
    using LibPagination for EnumerableSet.AddressSet;
    using LibPagination for EnumerableSet.Bytes32Set;
    using EnumerableSet for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.Bytes32Set;

    // ═══════════════════════════════════════════════════════════════════════════════
    // ROLE MANAGEMENT (Grant/Revoke/Apply) - Internal state-modifying functions
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Grant a role to an account
    /// @param role The role to grant
    /// @param account The account to grant the role to
    /// @return success True if the role was granted (was not already held), false if already held
    function grantRole(bytes32 role, address account) internal returns (bool success) {
        RoleDataStorage storage roleDataStorage = rolesStorage();
        success =
            roleDataStorage.roles[role].roleMembers.add(account) &&
            roleDataStorage.memberRoles[account].add(role);
    }

    /// @notice Revoke a role from an account
    /// @param role The role to revoke
    /// @param account The account to revoke the role from
    /// @return success True if the role was revoked (was held), false if not held
    function revokeRole(bytes32 role, address account) internal returns (bool success) {
        RoleDataStorage storage roleDataStorage = rolesStorage();
        success =
            roleDataStorage.roles[role].roleMembers.remove(account) &&
            roleDataStorage.memberRoles[account].remove(role);
    }

    /// @notice Apply multiple roles to an account (batch grant/revoke)
    /// @param roles Array of roles to apply
    /// @param actives Array of booleans indicating grant (true) or revoke (false) for each role
    /// @param account The account to apply roles to
    /// @return success Always true if no revert
    /// @dev Reverts with AccountHasNoRole if sender is not admin of any role
    /// @dev Reverts with RolesAndActivesLengthMismatch if arrays have different lengths
    function applyRoles(
        bytes32[] calldata roles,
        bool[] calldata actives,
        address account
    ) internal returns (bool success) {
        checkSameRolesAndActivesLength(roles.length, actives.length);

        address sender = msg.sender;
        uint256 length = roles.length;

        for (uint256 index; index < length; ) {
            checkRole(getRoleAdmin(roles[index]), sender);
            if (actives[index]) {
                if (!hasRole(roles[index], account)) {
                    grantRole(roles[index], account);
                }
                unchecked {
                    ++index;
                }
                continue;
            }
            if (hasRole(roles[index], account)) {
                revokeRole(roles[index], account);
            }
            unchecked {
                ++index;
            }
        }
        success = true;
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // ROLE CHECKS (View functions)
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Check if an account has a specific role
    /// @param role The role to check
    /// @param account The account to check
    /// @return True if account has the role, false otherwise
    function hasRole(bytes32 role, address account) internal view returns (bool) {
        return rolesStorage().memberRoles[account].contains(role);
    }

    /// @notice Check if an account has a specific role, revert if not
    /// @param role The role to check
    /// @param account The account to check
    /// @dev Reverts with AccountHasNoRole if account doesn't have the role
    function checkRole(bytes32 role, address account) internal view {
        if (!hasRole(role, account)) {
            revert IAccessControl.AccountHasNoRole(account, role);
        }
    }

    /// @notice Check if sender has a specific role, revert if not
    /// @param role The role to check
    /// @dev Reverts with AccountHasNoRole if sender doesn't have the role
    function checkRole(bytes32 role) internal view {
        checkRole(role, msg.sender);
    }

    /// @notice Check if an account has any of the provided roles
    /// @param roles Array of roles to check
    /// @param account The account to check
    /// @return True if account has at least one of the roles, false otherwise
    function hasAnyRole(bytes32[] memory roles, address account) internal view returns (bool) {
        for (uint256 i; i < roles.length; i++) {
            if (hasRole(roles[i], account)) {
                return true;
            }
        }
        return false;
    }

    /// @notice Check if an account has any of the provided roles, revert if not
    /// @param roles Array of roles to check
    /// @param account The account to check
    /// @dev Reverts with AccountHasNoRoles if account doesn't have any of the roles
    function checkAnyRole(bytes32[] memory roles, address account) internal view {
        if (!hasAnyRole(roles, account)) {
            revert IAccessControl.AccountHasNoRoles(account, roles);
        }
    }

    /// @notice Get the admin role for a given role
    /// @param role The role to get the admin for
    /// @return The admin role
    function getRoleAdmin(bytes32 role) internal view returns (bytes32) {
        return rolesStorage().roles[role].roleAdmin;
    }

    /// @notice Get the number of roles held by an account
    /// @param account The account to query
    /// @return roleCount The number of roles held by the account
    function getRoleCountFor(address account) internal view returns (uint256 roleCount) {
        roleCount = rolesStorage().memberRoles[account].length();
    }

    /// @notice Get a paginated list of roles held by an account
    /// @param account The account to query
    /// @param pageIndex The page index (0-based)
    /// @param pageLength The number of items per page
    /// @return roles Array of roles held by the account for the requested page
    function getRolesFor(
        address account,
        uint256 pageIndex,
        uint256 pageLength
    ) internal view returns (bytes32[] memory roles) {
        roles = rolesStorage().memberRoles[account].getFromSet(pageIndex, pageLength);
    }

    /// @notice Get the number of members with a specific role
    /// @param role The role to query
    /// @return memberCount The number of members with the role
    function getRoleMemberCount(bytes32 role) internal view returns (uint256 memberCount) {
        memberCount = rolesStorage().roles[role].roleMembers.length();
    }

    /// @notice Get a paginated list of members with a specific role
    /// @param role The role to query
    /// @param pageIndex The page index (0-based)
    /// @param pageLength The number of items per page
    /// @return members Array of member addresses for the requested page
    function getRoleMembers(
        bytes32 role,
        uint256 pageIndex,
        uint256 pageLength
    ) internal view returns (address[] memory members) {
        members = rolesStorage().roles[role].roleMembers.getFromSet(pageIndex, pageLength);
    }

    // ═══════════════════════════════════════════════════════════════════════════════
    // VALIDATION & INTERNAL HELPERS (Pure functions)
    // ═══════════════════════════════════════════════════════════════════════════════

    /// @notice Validate that roles and actives arrays have the same length
    /// @param rolesLength The length of the roles array
    /// @param activesLength The length of the actives array
    /// @dev Reverts with RolesAndActivesLengthMismatch if lengths differ
    function checkSameRolesAndActivesLength(uint256 rolesLength, uint256 activesLength) internal pure {
        if (rolesLength != activesLength) {
            revert IAccessControl.RolesAndActivesLengthMismatch(rolesLength, activesLength);
        }
    }
}
