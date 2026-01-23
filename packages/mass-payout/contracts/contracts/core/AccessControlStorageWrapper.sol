// SPDX-License-Identifier: Apache-2.0

pragma solidity 0.8.22;
// SPDX-License-Identifier: BSD-3-Clause-Attribution

import { LibCommon } from "../common/libraries/LibCommon.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { IAccessControlStorageWrapper } from "./interfaces/IAccessControlStorageWrapper.sol";
import { LocalContext } from "../common/LocalContext.sol";
import { _ACCESS_CONTROL_STORAGE_POSITION } from "../constants/storagePositions.sol";

abstract contract AccessControlStorageWrapper is IAccessControlStorageWrapper, LocalContext {
    using LibCommon for EnumerableSet.AddressSet;
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

    // Internal
    function _grantRole(bytes32 _role, address _account) internal returns (bool success_) {
        success_ =
            _rolesStorage().roles[_role].roleMembers.add(_account) &&
            _rolesStorage().memberRoles[_account].add(_role);
    }

    function _revokeRole(bytes32 _role, address _account) internal returns (bool success_) {
        success_ =
            _rolesStorage().roles[_role].roleMembers.remove(_account) &&
            _rolesStorage().memberRoles[_account].remove(_role);
    }

    function _getRoleAdmin(bytes32 _role) internal view returns (bytes32) {
        return _rolesStorage().roles[_role].roleAdmin;
    }

    function _hasRole(bytes32 _role, address _account) internal view returns (bool success_) {
        success_ = _rolesStorage().memberRoles[_account].contains(_role);
    }

    function _getRoleCountFor(address _account) internal view returns (uint256 roleCount_) {
        roleCount_ = _rolesStorage().memberRoles[_account].length();
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

    function _checkRole(bytes32 _role, address _account) internal view {
        if (!_hasRole(_role, _account)) {
            revert AccountHasNoRole(_account, _role);
        }
    }

    function _rolesStorage() internal pure returns (RoleDataStorage storage roles_) {
        bytes32 position = _ACCESS_CONTROL_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            roles_.slot := position
        }
    }
}
