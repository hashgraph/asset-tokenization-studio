// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { LibCommon } from "../../common/libraries/LibCommon.sol";
import { ArrayLib } from "../../common/libraries/ArrayLib.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import {
    IAccessControlStorageWrapper
} from "../../../layer_1/interfaces/accessControl/IAccessControlStorageWrapper.sol";
import { BusinessLogicResolverWrapper } from "../../../resolver/BusinessLogicResolverWrapper.sol";
import { _ACCESS_CONTROL_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import {Internals} from "../../Internals.sol";

abstract contract AccessControlStorageWrapper is
    IAccessControlStorageWrapper,
    Internals,
    BusinessLogicResolverWrapper
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

    modifier onlyRole(bytes32 _role) {
        _checkRole(_role, _msgSender());
        _;
    }

    modifier onlyRoleFor(bytes32 _role, address _account) {
        _checkRole(_role, _account);
        _;
    }

    modifier onlySameRolesAndActivesLength(uint256 _rolesLength, uint256 _activesLength) {
        _checkSameRolesAndActivesLength(_rolesLength, _activesLength);
        _;
    }

    modifier onlyConsistentRoles(bytes32[] calldata _roles, bool[] calldata _actives) {
        ArrayLib.checkUniqueValues(_roles, _actives);
        _;
    }

    // Internal
    function _grantRole(bytes32 _role, address _account) internal override returns (bool success_) {
        success_ = _grant(_rolesStorage(), _role, _account);
    }

    function _revokeRole(bytes32 _role, address _account) internal override returns (bool success_) {
        success_ = _remove(_rolesStorage(), _role, _account);
    }

    function _applyRoles(
        bytes32[] calldata _roles,
        bool[] calldata _actives,
        address _account
    ) internal override returns (bool success_) {
        RoleDataStorage storage roleDataStorage = _rolesStorage();
        address sender = _msgSender();
        uint256 length = _roles.length;
        for (uint256 index; index < length; ) {
            _checkRole(_getRoleAdmin(_roles[index]), sender);
            if (_actives[index]) {
                if (!_has(roleDataStorage, _roles[index], _account)) _grant(roleDataStorage, _roles[index], _account);
                unchecked {
                    ++index;
                }
                continue;
            }
            if (_has(roleDataStorage, _roles[index], _account)) _remove(roleDataStorage, _roles[index], _account);
            unchecked {
                ++index;
            }
        }
        success_ = true;
    }

    function _getRoleAdmin(bytes32 _role) internal view override returns (bytes32) {
        return _rolesStorage().roles[_role].roleAdmin;
    }

    function _hasRole(bytes32 _role, address _account) internal view override returns (bool) {
        return _has(_rolesStorage(), _role, _account);
    }

    function _hasAnyRole(bytes32[] memory _roles, address _account) internal view override returns (bool) {
        for (uint256 i; i < _roles.length; i++) {
            if (_has(_rolesStorage(), _roles[i], _account)) {
                return true;
            }
        }
        return false;
    }

    function _getRoleCountFor(address _account) internal view override returns (uint256 roleCount_) {
        roleCount_ = _rolesStorage().memberRoles[_account].length();
    }

    function _getRolesFor(
        address _account,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view override returns (bytes32[] memory roles_) {
        roles_ = _rolesStorage().memberRoles[_account].getFromSet(_pageIndex, _pageLength);
    }

    function _getRoleMemberCount(bytes32 _role) internal view override returns (uint256 memberCount_) {
        memberCount_ = _rolesStorage().roles[_role].roleMembers.length();
    }

    function _getRoleMembers(
        bytes32 _role,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view override returns (address[] memory members_) {
        members_ = _rolesStorage().roles[_role].roleMembers.getFromSet(_pageIndex, _pageLength);
    }

    function _checkRole(bytes32 _role, address _account) internal view override {
        if (!_hasRole(_role, _account)) {
            revert AccountHasNoRole(_account, _role);
        }
    }

    function _checkAnyRole(bytes32[] memory _roles, address _account) internal view override {
        if (!_hasAnyRole(_roles, _account)) {
            revert AccountHasNoRoles(_account, _roles);
        }
    }

    function _has(
        RoleDataStorage storage _rolesStorageData,
        bytes32 _role,
        address _account
    ) internal view returns (bool hasRole_) {
        hasRole_ = _rolesStorageData.memberRoles[_account].contains(_role);
    }

    function _rolesStorage() internal pure returns (RoleDataStorage storage roles_) {
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

    function _checkSameRolesAndActivesLength(uint256 _rolesLength, uint256 _activesLength) private pure {
        if (_rolesLength != _activesLength) {
            revert RolesAndActivesLengthMismatch(_rolesLength, _activesLength);
        }
    }
}
