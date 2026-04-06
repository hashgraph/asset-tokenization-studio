// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { Pagination } from "../../infrastructure/utils/Pagination.sol";
import { ArrayValidation } from "../../infrastructure/utils/ArrayValidation.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { _ACCESS_CONTROL_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";

/**
 * @title AccessControlStorageWrapper
 * @dev Library providing access control storage operations with Diamond Storage Pattern
 *
 * This library uses ERC-2535 Diamond Storage Pattern to store role data in a specific storage slot.
 * It provides storage operations, read functions, and guard checks for role-based access control.
 *
 * @notice Use with `using AccessControlStorageWrapper for RoleDataStorage;` or call functions directly
 * @author Asset Tokenization Studio Team
 */
struct RoleData {
    bytes32 roleAdmin;
    EnumerableSet.AddressSet roleMembers;
}

struct RoleDataStorage {
    mapping(bytes32 => RoleData) roles;
    mapping(address => EnumerableSet.Bytes32Set) memberRoles;
}

library AccessControlStorageWrapper {
    using Pagination for EnumerableSet.AddressSet;
    using Pagination for EnumerableSet.Bytes32Set;
    using EnumerableSet for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.Bytes32Set;

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

    // ✅ Diamond storage pattern
    function rolesStorage() internal pure returns (RoleDataStorage storage roles_) {
        bytes32 position = _ACCESS_CONTROL_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            roles_.slot := position
        }
    }

    // --- Pure functions ---

    function checkSameRolesAndActivesLength(uint256 _rolesLength, uint256 _activesLength) internal pure {
        if (_rolesLength != _activesLength) {
            revert RolesAndActivesLengthMismatch(_rolesLength, _activesLength);
        }
    }

    function checkConsistentRoles(bytes32[] calldata _roles, bool[] calldata _actives) internal pure {
        ArrayValidation.checkUniqueValues(_roles, _actives);
    }

    // --- Private view helpers ---

    function has(
        RoleDataStorage storage _rolesStorageData,
        bytes32 _role,
        address _account
    ) private view returns (bool hasRole_) {
        hasRole_ = _rolesStorageData.memberRoles[_account].contains(_role);
    }

    // --- Role management ---

    // solhint-disable-next-line ordering
    function grantRole(bytes32 _role, address _account) internal returns (bool success_) {
        RoleDataStorage storage roleDataStorage = rolesStorage();
        success_ =
            roleDataStorage.roles[_role].roleMembers.add(_account) &&
            roleDataStorage.memberRoles[_account].add(_role);
    }

    function revokeRole(bytes32 _role, address _account) internal returns (bool success_) {
        RoleDataStorage storage roleDataStorage = rolesStorage();
        success_ =
            roleDataStorage.roles[_role].roleMembers.remove(_account) &&
            roleDataStorage.memberRoles[_account].remove(_role);
    }

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

    // --- Guard functions ---

    function checkRole(bytes32 _role, address _account) internal view {
        if (!hasRole(_role, _account)) {
            revert AccountHasNoRole(_account, _role);
        }
    }

    function checkAnyRole(bytes32[] memory _roles, address _account) internal view {
        if (!hasAnyRole(_roles, _account)) {
            revert AccountHasNoRoles(_account, _roles);
        }
    }

    // --- Read functions ---

    function getRoleAdmin(bytes32 _role) internal view returns (bytes32) {
        return rolesStorage().roles[_role].roleAdmin;
    }

    function hasRole(bytes32 _role, address _account) internal view returns (bool) {
        return has(rolesStorage(), _role, _account);
    }

    function hasAnyRole(bytes32[] memory _roles, address _account) internal view returns (bool) {
        RoleDataStorage storage roleDataStorage = rolesStorage();
        for (uint256 i; i < _roles.length; ++i) {
            if (has(roleDataStorage, _roles[i], _account)) {
                return true;
            }
        }
        return false;
    }

    function getRoleCountFor(address _account) internal view returns (uint256 roleCount_) {
        roleCount_ = rolesStorage().memberRoles[_account].length();
    }

    function getRolesFor(
        address _account,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (bytes32[] memory roles_) {
        roles_ = rolesStorage().memberRoles[_account].getFromSet(_pageIndex, _pageLength);
    }

    function getRoleMemberCount(bytes32 _role) internal view returns (uint256 memberCount_) {
        memberCount_ = rolesStorage().roles[_role].roleMembers.length();
    }

    function getRoleMembers(
        bytes32 _role,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (address[] memory members_) {
        members_ = rolesStorage().roles[_role].roleMembers.getFromSet(_pageIndex, _pageLength);
    }
}
