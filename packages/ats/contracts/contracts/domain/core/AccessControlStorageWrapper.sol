// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { Pagination } from "../../infrastructure/utils/Pagination.sol";
import { ArrayValidation } from "../../infrastructure/utils/ArrayValidation.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { _ACCESS_CONTROL_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { IAccessControl } from "../../facets/layer_1/accessControl/IAccessControl.sol";

/**
 * @title AccessControlStorageWrapper
 * @dev Library providing access control storage operations with Diamond Storage Pattern
 *
 * This library uses ERC-2535 Diamond Storage Pattern to store role data in a specific storage slot.
 * It provides storage operations, read functions, and guard checks for role-based access control.
 *
 * @notice Use with `using AccessControlStorageWrapper for RoleDataStorage;` or call functions directly
 * @author Hashgraph
 */
library AccessControlStorageWrapper {
    using Pagination for EnumerableSet.AddressSet;
    using Pagination for EnumerableSet.Bytes32Set;
    using EnumerableSet for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.Bytes32Set;

    /// @notice Struct storing role data including admin and members
    struct RoleData {
        bytes32 roleAdmin;
        EnumerableSet.AddressSet roleMembers;
    }

    /// @notice Struct storing all role data with bidirectional mappings
    struct RoleDataStorage {
        mapping(bytes32 => RoleData) roles;
        mapping(address => EnumerableSet.Bytes32Set) memberRoles;
    }

    /// @notice Grants a role to an account
    /// @param _role Role to assign
    /// @param _account Account to assign role to
    /// @return success_ True if role was successfully granted
    function grantRole(bytes32 _role, address _account) internal returns (bool success_) {
        RoleDataStorage storage roleDataStorage = rolesStorage();
        success_ =
            roleDataStorage.roles[_role].roleMembers.add(_account) &&
            roleDataStorage.memberRoles[_account].add(_role);
    }

    /// @notice Revokes a role from an account
    /// @param _role Role to revoke
    /// @param _account Account to revoke role from
    /// @return success_ True if role was successfully revoked
    function revokeRole(bytes32 _role, address _account) internal returns (bool success_) {
        RoleDataStorage storage roleDataStorage = rolesStorage();
        success_ =
            roleDataStorage.roles[_role].roleMembers.remove(_account) &&
            roleDataStorage.memberRoles[_account].remove(_role);
    }

    /// @notice Applies multiple roles with active status to an account
    /// @param _roles Array of roles to apply
    /// @param _actives Array of active status for each role
    /// @param _account Account to modify roles for
    /// @return success_ True if all roles were applied successfully
    function applyRoles(
        bytes32[] calldata _roles,
        bool[] calldata _actives,
        address _account
    ) internal returns (bool success_) {
        RoleDataStorage storage roleDataStorage = rolesStorage();
        address sender = EvmAccessors.getMsgSender();
        uint256 length = _roles.length;
        for (uint256 index; index < length; ) {
            checkRole(getRoleAdmin(_roles[index]), sender);
            if (_actives[index]) {
                if (!has(roleDataStorage, _roles[index], _account)) {
                    roleDataStorage.roles[_roles[index]].roleMembers.add(_account);
                    roleDataStorage.memberRoles[_account].add(_roles[index]);
                }
                unchecked {
                    ++index;
                }
                continue;
            }
            if (has(roleDataStorage, _roles[index], _account)) {
                roleDataStorage.roles[_roles[index]].roleMembers.remove(_account);
                roleDataStorage.memberRoles[_account].remove(_roles[index]);
            }
            unchecked {
                ++index;
            }
        }
        success_ = true;
    }

    /// @notice Verifies account has the specified role, reverts if not
    /// @param _role Role to check
    /// @param _account Account to verify
    function checkRole(bytes32 _role, address _account) internal view {
        if (!hasRole(_role, _account)) revert IAccessControl.AccountHasNoRole(_account, _role);
    }

    /// @notice Verifies account has any of the specified roles, reverts if not
    /// @param _roles Array of roles to check
    /// @param _account Account to verify
    function checkAnyRole(bytes32[] memory _roles, address _account) internal view {
        if (!hasAnyRole(_roles, _account)) revert IAccessControl.AccountHasNoRoles(_account, _roles);
    }

    /// @notice Gets the admin role for a given role
    /// @param _role Role to get admin for
    /// @return Role admin bytes32
    function getRoleAdmin(bytes32 _role) internal view returns (bytes32) {
        return rolesStorage().roles[_role].roleAdmin;
    }

    /// @notice Checks if an account has a specific role
    /// @param _role Role to check
    /// @param _account Account to verify
    /// @return True if account has the role
    function hasRole(bytes32 _role, address _account) internal view returns (bool) {
        return has(rolesStorage(), _role, _account);
    }

    /// @notice Checks if an account has any of the specified roles
    /// @param _roles Array of roles to check
    /// @param _account Account to verify
    /// @return True if account has any of the roles
    function hasAnyRole(bytes32[] memory _roles, address _account) internal view returns (bool) {
        RoleDataStorage storage roleDataStorage = rolesStorage();
        for (uint256 i; i < _roles.length; ) {
            if (has(roleDataStorage, _roles[i], _account)) {
                return true;
            }
            unchecked {
                ++i;
            }
        }
        return false;
    }

    /// @notice Gets the number of roles assigned to an account
    /// @param _account Account to get role count for
    /// @return roleCount_ Number of roles
    function getRoleCountFor(address _account) internal view returns (uint256 roleCount_) {
        roleCount_ = rolesStorage().memberRoles[_account].length();
    }

    /// @notice Gets paginated roles for an account
    /// @param _account Account to get roles for
    /// @param _pageIndex Page index for pagination
    /// @param _pageLength Number of items per page
    /// @return roles_ Array of role bytes32
    function getRolesFor(
        address _account,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (bytes32[] memory roles_) {
        roles_ = rolesStorage().memberRoles[_account].getFromSet(_pageIndex, _pageLength);
    }

    /// @notice Gets the number of members in a role
    /// @param _role Role to get member count for
    /// @return memberCount_ Number of members
    function getRoleMemberCount(bytes32 _role) internal view returns (uint256 memberCount_) {
        memberCount_ = rolesStorage().roles[_role].roleMembers.length();
    }

    /// @notice Gets paginated members of a role
    /// @param _role Role to get members for
    /// @param _pageIndex Page index for pagination
    /// @param _pageLength Number of items per page
    /// @return members_ Array of member addresses
    function getRoleMembers(
        bytes32 _role,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (address[] memory members_) {
        members_ = rolesStorage().roles[_role].roleMembers.getFromSet(_pageIndex, _pageLength);
    }

    /// @notice Ensures roles and actives arrays have matching lengths
    /// @param _rolesLength Length of roles array
    /// @param _activesLength Length of actives array
    function checkSameRolesAndActivesLength(uint256 _rolesLength, uint256 _activesLength) internal pure {
        if (_rolesLength != _activesLength) {
            revert IAccessControl.RolesAndActivesLengthMismatch(_rolesLength, _activesLength);
        }
    }

    /// @notice Validates roles and actives arrays contain unique values
    /// @param _roles Array of roles to validate
    /// @param _actives Array of active status for each role
    function checkConsistentRoles(bytes32[] calldata _roles, bool[] calldata _actives) internal pure {
        ArrayValidation.checkUniqueValues(_roles, _actives);
    }

    /// @notice Internal helper to check if account has a specific role
    /// @param _rolesStorageData Storage reference to check against
    /// @param _role Role to check
    /// @param _account Account to verify
    /// @return hasRole_ True if account has the role
    function has(
        RoleDataStorage storage _rolesStorageData,
        bytes32 _role,
        address _account
    ) private view returns (bool hasRole_) {
        hasRole_ = _rolesStorageData.memberRoles[_account].contains(_role);
    }

    /// @notice Returns the RoleDataStorage storage pointer for the diamond storage position
    /// @return roles_ Storage pointer to RoleDataStorage
    function rolesStorage() private pure returns (RoleDataStorage storage roles_) {
        bytes32 position = _ACCESS_CONTROL_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            roles_.slot := position
        }
    }
}
