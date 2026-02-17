// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { NonceInternals } from "../nonce/NonceInternals.sol";

abstract contract AccessControlInternals is NonceInternals {
    function _applyRoles(
        bytes32[] calldata _roles,
        bool[] calldata _actives,
        address _account
    ) internal virtual returns (bool success_);
    function _grantRole(bytes32 _role, address _account) internal virtual returns (bool success_);
    function _revokeRole(bytes32 _role, address _account) internal virtual returns (bool success_);
    function _checkAnyRole(bytes32[] memory _roles, address _account) internal view virtual;
    function _checkRole(bytes32 _role, address _account) internal view virtual;
    function _getRoleAdmin(bytes32 _role) internal view virtual returns (bytes32);
    function _getRoleCountFor(address _account) internal view virtual returns (uint256 roleCount_);
    function _getRoleMemberCount(bytes32 _role) internal view virtual returns (uint256 memberCount_);
    function _getRoleMembers(
        bytes32 _role,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view virtual returns (address[] memory members_);
    function _getRolesFor(
        address _account,
        uint256 _pageIndex,
        uint256 _pageLength
    ) internal view virtual returns (bytes32[] memory roles_);
    function _hasAnyRole(bytes32[] memory _roles, address _account) internal view virtual returns (bool);
    function _hasRole(bytes32 _role, address _account) internal view virtual returns (bool);
}
