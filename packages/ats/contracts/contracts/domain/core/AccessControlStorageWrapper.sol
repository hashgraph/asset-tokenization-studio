// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { Pagination } from "../../infrastructure/utils/Pagination.sol";
import { ArrayValidation } from "../../infrastructure/utils/ArrayValidation.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { IAccessControlStorageWrapper } from "./accessControl/IAccessControlStorageWrapper.sol";
import { _ACCESS_CONTROL_STORAGE_POSITION } from "../../constants/storagePositions.sol";

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

    function _rolesStorage() internal pure returns (RoleDataStorage storage roles_) {
        bytes32 position = _ACCESS_CONTROL_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            roles_.slot := position
        }
    }

    // --- Guard functions (replacing modifiers) ---

    function _checkRole(bytes32 _role, address _account) internal view {
        if (!_hasRole(_role, _account)) {
            revert IAccessControlStorageWrapper.AccountHasNoRole(_account, _role);
        }
    }

    function _checkAnyRole(bytes32[] memory _roles, address _account) internal view {
        if (!_hasAnyRole(_roles, _account)) {
            revert IAccessControlStorageWrapper.AccountHasNoRoles(_account, _roles);
        }
    }

    function _checkSameRolesAndActivesLength(uint256 _rolesLength, uint256 _activesLength) internal pure {
        if (_rolesLength != _activesLength) {
            revert IAccessControlStorageWrapper.RolesAndActivesLengthMismatch(_rolesLength, _activesLength);
        }
    }

    function _checkConsistentRoles(bytes32[] calldata _roles, bool[] calldata _actives) internal pure {
        ArrayValidation.checkUniqueValues(_roles, _actives);
    }

    // --- Role management ---

    function _grantRole(bytes32 _role, address _account) internal returns (bool success_) {
        RoleDataStorage storage roleDataStorage = _rolesStorage();
        success_ =
            roleDataStorage.roles[_role].roleMembers.add(_account) &&
            roleDataStorage.memberRoles[_account].add(_role);
    }

    function _revokeRole(bytes32 _role, address _account) internal returns (bool success_) {
        RoleDataStorage storage roleDataStorage = _rolesStorage();
        success_ =
            roleDataStorage.roles[_role].roleMembers.remove(_account) &&
            roleDataStorage.memberRoles[_account].remove(_role);
    }

    function _applyRoles(
        bytes32[] calldata _roles,
        bool[] calldata _actives,
        address _account
    ) internal returns (bool success_) {
        RoleDataStorage storage roleDataStorage = _rolesStorage();
        address sender = msg.sender;
        uint256 length = _roles.length;
        for (uint256 index; index < length; ) {
            _checkRole(_getRoleAdmin(_roles[index]), sender);
            if (_actives[index]) {
                if (!_has(roleDataStorage, _roles[index], _account)) {
                    roleDataStorage.roles[_roles[index]].roleMembers.add(_account);
                    roleDataStorage.memberRoles[_account].add(_roles[index]);
                }
                unchecked {
                    ++index;
                }
                continue;
            }
            if (_has(roleDataStorage, _roles[index], _account)) {
                roleDataStorage.roles[_roles[index]].roleMembers.remove(_account);
                roleDataStorage.memberRoles[_account].remove(_roles[index]);
            }
            unchecked {
                ++index;
            }
        }
        success_ = true;
    }

    // --- Read functions ---

    function _getRoleAdmin(bytes32 _role) internal view returns (bytes32) {
        return _rolesStorage().roles[_role].roleAdmin;
    }

    function _hasRole(bytes32 _role, address _account) internal view returns (bool) {
        return _has(_rolesStorage(), _role, _account);
    }

    function _hasAnyRole(bytes32[] memory _roles, address _account) internal view returns (bool) {
        RoleDataStorage storage roleDataStorage = _rolesStorage();
        for (uint256 i; i < _roles.length; i++) {
            if (_has(roleDataStorage, _roles[i], _account)) {
                return true;
            }
        }
        return false;
    }

    function _getRoleCountFor(address _account) internal view returns (uint256 roleCount_) {
        roleCount_ = _rolesStorage().memberRoles[_account].length();
    }

    function _getRolesFor(
        address _account,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (bytes32[] memory roles_) {
        roles_ = _rolesStorage().memberRoles[_account].getFromSet(_pageIndex, _pageLength);
    }

    function _getRoleMemberCount(bytes32 _role) internal view returns (uint256 memberCount_) {
        memberCount_ = _rolesStorage().roles[_role].roleMembers.length();
    }

    function _getRoleMembers(
        bytes32 _role,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view returns (address[] memory members_) {
        members_ = _rolesStorage().roles[_role].roleMembers.getFromSet(_pageIndex, _pageLength);
    }

    // --- Private helpers ---

    function _has(
        RoleDataStorage storage _rolesStorageData,
        bytes32 _role,
        address _account
    ) private view returns (bool hasRole_) {
        hasRole_ = _rolesStorageData.memberRoles[_account].contains(_role);
    }
}
