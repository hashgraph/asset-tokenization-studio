// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { AccessControlStorageWrapper, RoleDataStorage } from "../../domain/core/AccessControlStorageWrapper.sol";
import { _FREEZE_MANAGER_ROLE, _AGENT_ROLE } from "../../constants/roles.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";

/**
 * @title AccessControlModifiers
 * @dev Abstract contract providing mandatory AccessControl modifiers
 *
 * This contract provides reusable modifiers for validating access control
 * requirements. All facets should inherit from this contract to ensure
 * consistent role validation across the codebase.
 *
 * @notice Modifiers are MANDATORY unless compilation fails or bytecode exceeds limits
 * @author Asset Tokenization Studio Team
 */
abstract contract AccessControlModifiers {
    using AccessControlStorageWrapper for RoleDataStorage;

    /**
     * @dev Emitted when a role check fails
     */
    error AccessControlRequired(bytes32 role, address sender);

    /**
     * @dev Modifier that validates msg.sender has the specified role
     *
     * Requirements:
     * - msg.sender must have the role specified in _role parameter
     *
     * @param _role The role to check for
     */
    modifier onlyRole(bytes32 _role) virtual {
        AccessControlStorageWrapper.checkRole(_role, EvmAccessors.getMsgSender());
        _;
    }

    /**
     * @dev Modifier that validates msg.sender has any of the specified roles
     *
     * Requirements:
     * - msg.sender must have at least one role from the _roles array
     *
     * @param _roles Array of roles to check for
     */
    modifier onlyAnyRole(bytes32[] memory _roles) virtual {
        AccessControlStorageWrapper.checkAnyRole(_roles, EvmAccessors.getMsgSender());
        _;
    }

    /**
     * @dev Modifier that validates roles and actives arrays have the same length
     *
     * Requirements:
     * - _rolesLength must equal _activesLength
     *
     * @param _rolesLength Length of roles array
     * @param _activesLength Length of actives array
     */
    modifier onlySameRolesAndActivesLength(uint256 _rolesLength, uint256 _activesLength) virtual {
        AccessControlStorageWrapper.checkSameRolesAndActivesLength(_rolesLength, _activesLength);
        _;
    }

    /**
     * @dev Modifier that validates roles and actives arrays are consistent (unique values)
     *
     * Requirements:
     * - Roles and actives must have unique values (no duplicates)
     *
     * @param _roles Array of roles to validate
     * @param _actives Array of actives to validate
     */
    modifier onlyConsistentRoles(bytes32[] calldata _roles, bool[] calldata _actives) virtual {
        AccessControlStorageWrapper.checkConsistentRoles(_roles, _actives);
        _;
    }

    /**
     * @dev Modifier that verifies the given account holds at least one of the
     * roles authorized to perform freeze operations: FREEZE_MANAGER_ROLE or
     * AGENT_ROLE.
     *
     * Requirements:
     * - `_account` must have either FREEZE_MANAGER_ROLE or AGENT_ROLE.
     *
     * @param _account The address to check roles for.
     */
    modifier onlyFreezeRoles(address _account) virtual {
        bytes32[] memory roles = new bytes32[](2);
        roles[0] = _FREEZE_MANAGER_ROLE;
        roles[1] = _AGENT_ROLE;
        AccessControlStorageWrapper.checkAnyRole(roles, _account);
        _;
    }

    /**
     * @dev Modifier that verifies the transaction sender holds at least one of the two given
     * roles. Generic variant of `onlyAnyRole` for the common "role A or role B" check, so that
     * call sites do not need to allocate and populate the roles array inline.
     *
     * Requirements:
     * - the resolved sender must have either `_roleA` or `_roleB`.
     *
     * @param _roleA The first role identifier.
     * @param _roleB The second role identifier.
     */
    modifier onlyRolesPair(bytes32 _roleA, bytes32 _roleB) virtual {
        bytes32[] memory roles = new bytes32[](2);
        roles[0] = _roleA;
        roles[1] = _roleB;
        AccessControlStorageWrapper.checkAnyRole(roles, EvmAccessors.getMsgSender());
        _;
    }
}
