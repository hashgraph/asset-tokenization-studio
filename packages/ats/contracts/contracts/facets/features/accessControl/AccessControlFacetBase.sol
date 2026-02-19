// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IAccessControl } from "../interfaces/accessControl/IAccessControl.sol";
import { IStaticFunctionSelectors } from "../../../infrastructure/interfaces/IStaticFunctionSelectors.sol";
import { LibAccess } from "../../../lib/core/LibAccess.sol";
import { LibPause } from "../../../lib/core/LibPause.sol";
import { LibArrayValidation } from "../../../infrastructure/lib/LibArrayValidation.sol";

abstract contract AccessControlFacetBase is IAccessControl, IStaticFunctionSelectors {
    function grantRole(bytes32 _role, address _account) external override returns (bool success_) {
        LibAccess.checkRole(LibAccess.getRoleAdmin(_role));
        LibPause.requireNotPaused();

        if (!LibAccess.grantRole(_role, _account)) {
            revert AccountAssignedToRole(_role, _account);
        }
        emit RoleGranted(msg.sender, _account, _role);
        return true;
    }

    function revokeRole(bytes32 _role, address _account) external override returns (bool success_) {
        LibAccess.checkRole(LibAccess.getRoleAdmin(_role));
        LibPause.requireNotPaused();

        success_ = LibAccess.revokeRole(_role, _account);
        if (!success_) {
            revert AccountNotAssignedToRole(_role, _account);
        }
        emit RoleRevoked(msg.sender, _account, _role);
    }

    function applyRoles(
        bytes32[] calldata _roles,
        bool[] calldata _actives,
        address _account
    ) external override returns (bool success_) {
        LibPause.requireNotPaused();
        LibAccess.checkSameRolesAndActivesLength(_roles.length, _actives.length);
        LibArrayValidation.checkUniqueValues(_roles, _actives);

        success_ = LibAccess.applyRoles(_roles, _actives, _account);
        if (!success_) {
            revert RolesNotApplied(_roles, _actives, _account);
        }
        emit RolesApplied(_roles, _actives, _account);
    }

    function renounceRole(bytes32 _role) external override returns (bool success_) {
        LibPause.requireNotPaused();

        address account = msg.sender;
        success_ = LibAccess.revokeRole(_role, account);
        if (!success_) {
            revert AccountNotAssignedToRole(_role, account);
        }
        emit RoleRenounced(account, _role);
    }

    function hasRole(bytes32 _role, address _account) external view override returns (bool) {
        return LibAccess.hasRole(_role, _account);
    }

    function getRoleCountFor(address _account) external view override returns (uint256 roleCount_) {
        roleCount_ = LibAccess.getRoleCountFor(_account);
    }

    function getRolesFor(
        address _account,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (bytes32[] memory roles_) {
        roles_ = LibAccess.getRolesFor(_account, _pageIndex, _pageLength);
    }

    function getRoleMemberCount(bytes32 _role) external view override returns (uint256 memberCount_) {
        memberCount_ = LibAccess.getRoleMemberCount(_role);
    }

    function getRoleMembers(
        bytes32 _role,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (address[] memory members_) {
        members_ = LibAccess.getRoleMembers(_role, _pageIndex, _pageLength);
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](9);
        staticFunctionSelectors_[selectorIndex++] = this.grantRole.selector;
        staticFunctionSelectors_[selectorIndex++] = this.revokeRole.selector;
        staticFunctionSelectors_[selectorIndex++] = this.renounceRole.selector;
        staticFunctionSelectors_[selectorIndex++] = this.applyRoles.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getRoleCountFor.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getRolesFor.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getRoleMemberCount.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getRoleMembers.selector;
        staticFunctionSelectors_[selectorIndex++] = this.hasRole.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IAccessControl).interfaceId;
    }
}
