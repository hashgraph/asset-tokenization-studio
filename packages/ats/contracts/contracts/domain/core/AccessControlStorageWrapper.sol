// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { Pagination } from "../../infrastructure/utils/Pagination.sol";
import { ArrayValidation } from "../../infrastructure/utils/ArrayValidation.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { IAccessControl } from "../../facets/accessControl/IAccessControl.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";

/// @custom:hash storage AccessControl
bytes32 constant STORAGE_LOCATION_ACCESS_CONTROL = 0xff8881325a7cc80adb7ddfb5e52c7103d092b4d7833f49efafbcb1abd73a4900;

struct RoleData {
    bytes32 roleAdmin;
    EnumerableSet.AddressSet roleMembers;
}

/// @custom:storage-location erc7201:security.token.standard.storage.AccessControl
struct RoleDataStorage {
    mapping(bytes32 => RoleData) roles;
    mapping(address => EnumerableSet.Bytes32Set) memberRoles;
}

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
library AccessControlStorageWrapper {
    using Pagination for EnumerableSet.AddressSet;
    using Pagination for EnumerableSet.Bytes32Set;
    using EnumerableSet for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.Bytes32Set;

    // ✅ Diamond storage pattern
    function rolesStorage() internal pure returns (RoleDataStorage storage roles_) {
        bytes32 position = STORAGE_LOCATION_ACCESS_CONTROL;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            roles_.slot := position
        }
    }

    function checkSameRolesAndActivesLength(uint256 _rolesLength, uint256 _activesLength) internal pure {
        if (_rolesLength != _activesLength) {
            revert IAccessControl.RolesAndActivesLengthMismatch(_rolesLength, _activesLength);
        }
    }

    function checkConsistentRoles(bytes32[] calldata _roles, bool[] calldata _actives) internal pure {
        ArrayValidation.checkUniqueValues(_roles, _actives);
    }

    function _has(
        RoleDataStorage storage _rolesStorageData,
        bytes32 _role,
        address _account
    ) private view returns (bool hasRole_) {
        hasRole_ = _rolesStorageData.memberRoles[_account].contains(_role);
    }

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

    function checkRole(bytes32 _role, address _account) internal view {
        if (!hasRole(_role, _account)) revert IAccessControl.AccountHasNoRole(_account, _role);
    }

    function checkAnyRole(bytes32[] memory _roles, address _account) internal view {
        if (!hasAnyRole(_roles, _account)) revert IAccessControl.AccountHasNoRoles(_account, _roles);
    }

    /// @notice Reverts if the caller is the sole holder of `DEFAULT_ADMIN_ROLE`.
    /// @dev Guards `renounceRole` so the contract cannot be left without an admin.
    /// @param _role The role being renounced.
    function checkNotSoleAdmin(bytes32 _role) internal view {
        if (_isSoleAdmin(_role)) revert IAccessControl.CannotRenounceSoleAdmin();
    }

    /// @notice Returns `true` when `_role` is `DEFAULT_ADMIN_ROLE` and only one member holds it.
    /// @param _role The role to inspect.
    /// @return `true` if the caller would be the sole admin after renouncing.
    function _isSoleAdmin(bytes32 _role) private view returns (bool) {
        return _role == DEFAULT_ADMIN_ROLE && rolesStorage().roles[_role].roleMembers.length() == 1;
    }

    function getRoleAdmin(bytes32 _role) internal view returns (bytes32) {
        return rolesStorage().roles[_role].roleAdmin;
    }

    function hasRole(bytes32 _role, address _account) internal view returns (bool) {
        return _has(rolesStorage(), _role, _account);
    }

    function hasAnyRole(bytes32[] memory _roles, address _account) internal view returns (bool) {
        RoleDataStorage storage roleDataStorage = rolesStorage();
        for (uint256 i; i < _roles.length; ) {
            if (_has(roleDataStorage, _roles[i], _account)) {
                return true;
            }
            unchecked {
                ++i;
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
