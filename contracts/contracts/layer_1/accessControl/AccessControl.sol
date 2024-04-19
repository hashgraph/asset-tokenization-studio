pragma solidity 0.8.18;
// SPDX-License-Identifier: BSD-3-Clause-Attribution

import {IAccessControl} from '../interfaces/accessControl/IAccessControl.sol';
import {
    IStaticFunctionSelectors
} from '../../interfaces/diamond/IStaticFunctionSelectors.sol';
import {Common} from '../common/Common.sol';
import {_ACCESS_CONTROL_RESOLVER_KEY} from '../constants/resolverKeys.sol';

contract AccessControl is IAccessControl, IStaticFunctionSelectors, Common {
    function grantRole(
        bytes32 _role,
        address _account
    )
        external
        virtual
        override
        onlyRole(_getRoleAdmin(_role))
        onlyUnpaused
        returns (bool success_)
    {
        success_ = _grantRole(_role, _account);
        if (!success_) {
            revert AccountAssignedToRole(_role, _account);
        }
        emit RoleGranted(_msgSender(), _account, _role);
    }

    function revokeRole(
        bytes32 _role,
        address _account
    )
        external
        virtual
        override
        onlyRole(_getRoleAdmin(_role))
        onlyUnpaused
        returns (bool success_)
    {
        success_ = _revokeRole(_role, _account);
        if (!success_) {
            revert AccountNotAssignedToRole(_role, _account);
        }
        emit RoleRevoked(_msgSender(), _account, _role);
    }

    function applyRoles(
        bytes32[] calldata _roles,
        bool[] calldata _actives,
        address _account
    )
        external
        override
        onlyUnpaused
        onlySameRolesAndActivesLength(_roles.length, _actives.length)
        returns (bool success_)
    {
        success_ = _applyRoles(_roles, _actives, _account);
        if (!success_) {
            revert RolesNotApplied(_roles, _actives, _account);
        }
        emit RolesApplied(_roles, _actives, _account);
    }

    function renounceRole(
        bytes32 _role
    ) external virtual override onlyUnpaused returns (bool success_) {
        address account = _msgSender();
        success_ = _revokeRole(_role, account);
        if (!success_) {
            revert AccountNotAssignedToRole(_role, account);
        }
        emit RoleRenounced(account, _role);
    }

    function hasRole(
        bytes32 _role,
        address _account
    ) external view virtual override returns (bool) {
        return _hasRole(_role, _account);
    }

    function getRoleCountFor(
        address _account
    ) external view virtual override returns (uint256 roleCount_) {
        roleCount_ = _getRoleCountFor(_account);
    }

    function getRolesFor(
        address _account,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view virtual override returns (bytes32[] memory roles_) {
        roles_ = _getRolesFor(_account, _pageIndex, _pageLength);
    }

    function getRoleMemberCount(
        bytes32 _role
    ) external view virtual override returns (uint256 memberCount_) {
        memberCount_ = _getRoleMemberCount(_role);
    }

    function getRoleMembers(
        bytes32 _role,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view virtual override returns (address[] memory members_) {
        members_ = _getRoleMembers(_role, _pageIndex, _pageLength);
    }

    function getStaticResolverKey()
        external
        pure
        virtual
        override
        returns (bytes32 staticResolverKey_)
    {
        staticResolverKey_ = _ACCESS_CONTROL_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors()
        external
        pure
        virtual
        override
        returns (bytes4[] memory staticFunctionSelectors_)
    {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](9);
        staticFunctionSelectors_[selectorIndex++] = this.grantRole.selector;
        staticFunctionSelectors_[selectorIndex++] = this.revokeRole.selector;
        staticFunctionSelectors_[selectorIndex++] = this.renounceRole.selector;
        staticFunctionSelectors_[selectorIndex++] = this.applyRoles.selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .getRoleCountFor
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this.getRolesFor.selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .getRoleMemberCount
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .getRoleMembers
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this.hasRole.selector;
    }

    function getStaticInterfaceIds()
        external
        pure
        virtual
        override
        returns (bytes4[] memory staticInterfaceIds_)
    {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IAccessControl)
            .interfaceId;
    }
}
