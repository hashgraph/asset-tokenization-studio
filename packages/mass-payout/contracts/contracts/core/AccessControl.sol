// SPDX-License-Identifier: Apache-2.0

pragma solidity 0.8.22;

import { IAccessControl } from "./interfaces/IAccessControl.sol";
import { Common } from "../common/Common.sol";

abstract contract AccessControl is IAccessControl, Common {
    function grantRole(
        bytes32 _role,
        address _account
    ) external override onlyRole(_getRoleAdmin(_role)) onlyUnpaused returns (bool success_) {
        success_ = _grantRole(_role, _account);
        if (!success_) {
            revert AccountAssignedToRole(_role, _account);
        }
        emit RoleGranted(_msgSender(), _account, _role);
    }

    function revokeRole(
        bytes32 _role,
        address _account
    ) external override onlyRole(_getRoleAdmin(_role)) onlyUnpaused returns (bool success_) {
        success_ = _revokeRole(_role, _account);
        if (!success_) {
            revert AccountNotAssignedToRole(_role, _account);
        }
        emit RoleRevoked(_msgSender(), _account, _role);
    }

    function renounceRole(bytes32 _role) external override onlyUnpaused returns (bool success_) {
        address account = _msgSender();
        success_ = _revokeRole(_role, account);
        if (!success_) {
            revert AccountNotAssignedToRole(_role, account);
        }
        emit RoleRenounced(account, _role);
    }

    function hasRole(bytes32 _role, address _account) external view override returns (bool) {
        return _hasRole(_role, _account);
    }

    function getRoleCountFor(address _account) external view override returns (uint256 roleCount_) {
        roleCount_ = _getRoleCountFor(_account);
    }

    function getRoleMemberCount(bytes32 _role) external view override returns (uint256 memberCount_) {
        memberCount_ = _getRoleMemberCount(_role);
    }

    function getRoleMembers(
        bytes32 _role,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (address[] memory members_) {
        members_ = _getRoleMembers(_role, _pageIndex, _pageLength);
    }
}
