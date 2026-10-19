// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IAccessControl } from "./IAccessControl.sol";
import { AccessControlStorageWrapper } from "../../domain/core/AccessControlStorageWrapper.sol";
import { Modifiers } from "../../services/Modifiers.sol";

/**
 * @title AccessControlRead
 * @author Asset Tokenization Studio Team
 * @notice Read-only base for `AccessControlBase` (and, through it, `AccessControl` and
 *         `AccessControlOperational`). Implements all view functions of IAccessControl.
 *         Write functions are implemented once in `AccessControlBase` and exposed by the
 *         two subclasses with the guard modifiers appropriate to a proxy facet or a
 *         direct-inheritance contract.
 */
abstract contract AccessControlRead is IAccessControl, Modifiers {
    /// @inheritdoc IAccessControl
    function hasRole(bytes32 _role, address _account) external view override returns (bool) {
        return AccessControlStorageWrapper.hasRole(_role, _account);
    }

    /// @inheritdoc IAccessControl
    function getRoleCountFor(address _account) external view override returns (uint256 roleCount_) {
        roleCount_ = AccessControlStorageWrapper.getRoleCountFor(_account);
    }

    /// @inheritdoc IAccessControl
    function getRolesFor(
        address _account,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (bytes32[] memory roles_) {
        roles_ = AccessControlStorageWrapper.getRolesFor(_account, _pageIndex, _pageLength);
    }

    /// @inheritdoc IAccessControl
    function getRoleMemberCount(bytes32 _role) external view override returns (uint256 memberCount_) {
        memberCount_ = AccessControlStorageWrapper.getRoleMemberCount(_role);
    }

    /// @inheritdoc IAccessControl
    function getRoleMembers(
        bytes32 _role,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (address[] memory members_) {
        members_ = AccessControlStorageWrapper.getRoleMembers(_role, _pageIndex, _pageLength);
    }
}
