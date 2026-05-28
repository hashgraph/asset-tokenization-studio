// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IAccessControl, RESOLVER_KEY_ACCESS_CONTROL } from "./IAccessControl.sol";
import { AccessControlRead } from "./AccessControlRead.sol";
import { AccessControlStorageWrapper } from "../../domain/core/AccessControlStorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";

/**
 * @title AccessControlOperational
 * @author Asset Tokenization Studio Team
 * @notice Variant of AccessControl for proxy facets only. Identical to AccessControl except
 *         every state-changing function requires onlyOperational as its first modifier.
 *         Use AccessControl (without onlyOperational) for direct-inheritance consumers such
 *         as DiamondCutManager that do not operate through the ResolverProxy pattern.
 * @dev Implements `IAccessControl`. Intended to be inherited exclusively by `AccessControlFacet`.
 */
abstract contract AccessControlOperational is AccessControlRead {
    /// @inheritdoc IAccessControl
    function initializeAccessControl()
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyFacetNotRegistered(RESOLVER_KEY_ACCESS_CONTROL)
    {
        InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_ACCESS_CONTROL);
        emit IAccessControl.AccessControlInitialized();
    }

    /// @inheritdoc IAccessControl
    /// @dev Requires the token to be operational and unpaused, and the caller to hold the admin role of `_role`.
    function grantRole(
        bytes32 _role,
        address _account
    )
        external
        override
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlyRole(AccessControlStorageWrapper.getRoleAdmin(_role))
        returns (bool success_)
    {
        if (!AccessControlStorageWrapper.grantRole(_role, _account)) {
            revert AccountAssignedToRole(_role, _account);
        }
        emit RoleGranted(EvmAccessors.getMsgSender(), _account, _role);
        return true;
    }

    /// @inheritdoc IAccessControl
    /// @dev Requires the token to be operational and unpaused, and the caller to hold the admin role of `_role`.
    function revokeRole(
        bytes32 _role,
        address _account
    )
        external
        override
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlyRole(AccessControlStorageWrapper.getRoleAdmin(_role))
        returns (bool success_)
    {
        success_ = AccessControlStorageWrapper.revokeRole(_role, _account);
        if (!success_) {
            revert AccountNotAssignedToRole(_role, _account);
        }
        emit RoleRevoked(EvmAccessors.getMsgSender(), _account, _role);
    }

    /// @inheritdoc IAccessControl
    /// @dev Requires the token to be operational and unpaused. No admin role required; acts on `msg.sender`.
    ///      Reverts with `CannotRenounceSoleAdmin` if the caller is the sole DEFAULT_ADMIN_ROLE holder.
    function renounceRole(
        bytes32 _role
    ) external override onlyOperational onlyActivated onlyUnpaused returns (bool success_) {
        address account = EvmAccessors.getMsgSender();
        AccessControlStorageWrapper.checkNotSoleAdmin(_role);
        success_ = AccessControlStorageWrapper.revokeRole(_role, account);
        if (!success_) {
            revert AccountNotAssignedToRole(_role, account);
        }
        emit RoleRenounced(account, _role);
    }

    /// @inheritdoc IAccessControl
    /// @dev Requires the token to be operational and unpaused, equal-length arrays, and no duplicate role
    ///      entries. Per-role admin checks are enforced inside the storage layer.
    function applyRoles(
        bytes32[] calldata _roles,
        bool[] calldata _actives,
        address _account
    )
        external
        override
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlySameRolesAndActivesLength(_roles.length, _actives.length)
        onlyConsistentRoles(_roles, _actives)
    {
        (bytes32[] memory appliedRoles, bool[] memory appliedStates) = AccessControlStorageWrapper.applyRoles(
            _roles,
            _actives,
            _account
        );
        emit RolesApplied(_roles, _actives, _account, appliedRoles, appliedStates);
    }
}
