pragma solidity 0.8.18;
// SPDX-License-Identifier: BSD-3-Clause-Attribution

import {LibCommon} from '../common/LibCommon.sol';
import {
    EnumerableSet
} from '@openzeppelin/contracts/utils/structs/EnumerableSet.sol';
import {
    IAccessControlStorageWrapper
} from '../interfaces/accessControl/IAccessControlStorageWrapper.sol';
import {LocalContext} from '../context/LocalContext.sol';
import {
    _ACCESS_CONTROL_STORAGE_POSITION
} from '../constants/storagePositions.sol';

abstract contract AccessControlStorageWrapper is
    IAccessControlStorageWrapper,
    LocalContext
{
    // TODO: Check if it's possible to use only one dependency of AddressSet and Bytes32Set
    using LibCommon for EnumerableSet.AddressSet;
    using LibCommon for EnumerableSet.Bytes32Set;
    using EnumerableSet for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.Bytes32Set;

    struct RoleData {
        bytes32 roleAdmin;
        EnumerableSet.AddressSet roleMembers;
    }

    struct RoleDataStorage {
        mapping(bytes32 => RoleData) roles;
        mapping(address => EnumerableSet.Bytes32Set) memberRoles;
    }

    modifier onlyRole(bytes32 role) {
        _checkRole(role);
        _;
    }

    modifier onlySameRolesAndActivesLength(
        uint256 _rolesLength,
        uint256 _activesLength
    ) {
        if (_rolesLength != _activesLength) {
            revert RolesAndActivesLengthMismatch(_rolesLength, _activesLength);
        }
        _;
    }

    // Internal
    function _grantRole(
        bytes32 _role,
        address _account
    ) internal virtual returns (bool success_) {
        success_ = _grant(_rolesStorage(), _role, _account);
    }

    function _revokeRole(
        bytes32 _role,
        address _account
    ) internal virtual returns (bool success_) {
        success_ = _remove(_rolesStorage(), _role, _account);
    }

    function _applyRoles(
        bytes32[] calldata _roles,
        bool[] calldata _actives,
        address _account
    ) internal returns (bool success_) {
        RoleDataStorage storage roleDataStorage = _rolesStorage();
        address sender = _msgSender();
        for (uint256 index = 0; index < _roles.length; index++) {
            _checkRole(_getRoleAdmin(_roles[index]), sender);
            if (
                _actives[index] &&
                !_has(roleDataStorage, _roles[index], _account)
            ) {
                _grant(roleDataStorage, _roles[index], _account);
            }
            if (
                !_actives[index] &&
                _has(roleDataStorage, _roles[index], _account)
            ) {
                _remove(roleDataStorage, _roles[index], _account);
            }
        }
        success_ = true;
    }

    function _getRoleAdmin(
        bytes32 _role
    ) internal view virtual returns (bytes32) {
        return _rolesStorage().roles[_role].roleAdmin;
    }

    function _hasRole(
        bytes32 _role,
        address _account
    ) internal view virtual returns (bool) {
        return _has(_rolesStorage(), _role, _account);
    }

    function _getRoleCountFor(
        address _account
    ) internal view virtual returns (uint256 roleCount_) {
        roleCount_ = _rolesStorage().memberRoles[_account].length();
    }

    function _getRolesFor(
        address _account,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view virtual returns (bytes32[] memory roles_) {
        roles_ = _rolesStorage().memberRoles[_account].getFromSet(
            _pageIndex,
            _pageLength
        );
    }

    function _getRoleMemberCount(
        bytes32 _role
    ) internal view virtual returns (uint256 memberCount_) {
        memberCount_ = _rolesStorage().roles[_role].roleMembers.length();
    }

    function _getRoleMembers(
        bytes32 _role,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view virtual returns (address[] memory members_) {
        members_ = _rolesStorage().roles[_role].roleMembers.getFromSet(
            _pageIndex,
            _pageLength
        );
    }

    function _checkRole(bytes32 _role) internal view virtual {
        _checkRole(_role, _msgSender());
    }

    function _checkRole(bytes32 _role, address _account) internal view virtual {
        if (!_hasRole(_role, _account)) {
            revert AccountHasNoRole(_account, _role);
        }
    }

    function _rolesStorage()
        internal
        pure
        virtual
        returns (RoleDataStorage storage roles_)
    {
        bytes32 position = _ACCESS_CONTROL_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            roles_.slot := position
        }
    }

    function _grant(
        RoleDataStorage storage _roleDataStorage,
        bytes32 _role,
        address _account
    ) private returns (bool success_) {
        success_ =
            _roleDataStorage.roles[_role].roleMembers.add(_account) &&
            _roleDataStorage.memberRoles[_account].add(_role);
    }

    function _remove(
        RoleDataStorage storage _roleDataStorage,
        bytes32 _role,
        address _account
    ) private returns (bool success_) {
        success_ =
            _roleDataStorage.roles[_role].roleMembers.remove(_account) &&
            _roleDataStorage.memberRoles[_account].remove(_role);
    }

    function _has(
        RoleDataStorage storage _rolesStorageData,
        bytes32 _role,
        address _account
    ) internal view virtual returns (bool hasRole_) {
        hasRole_ = _rolesStorageData.memberRoles[_account].contains(_role);
    }
}
