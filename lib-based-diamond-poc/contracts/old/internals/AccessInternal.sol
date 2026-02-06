// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "../../diamond/DiamondStorage.sol";

/**
 * OLD ARCHITECTURE - AccessInternal
 *
 * Another piece of the inheritance monster.
 * Contains ALL role-based access control logic.
 */
abstract contract AccessInternal {
    // =========================================================================
    // ERRORS
    // =========================================================================
    error AccessControlUnauthorizedAccount(address account, bytes32 role);

    // =========================================================================
    // EVENTS
    // =========================================================================
    event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender);
    event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender);

    // =========================================================================
    // MODIFIERS
    // =========================================================================
    modifier onlyRole(bytes32 role) {
        _checkRole(role);
        _;
    }

    // =========================================================================
    // INTERNAL FUNCTIONS
    // =========================================================================
    function _hasRole(bytes32 role, address account) internal view returns (bool) {
        return accessStorage().roles[role][account];
    }

    function _checkRole(bytes32 role) internal view {
        _checkRole(role, msg.sender);
    }

    function _checkRole(bytes32 role, address account) internal view {
        if (!_hasRole(role, account)) {
            revert AccessControlUnauthorizedAccount(account, role);
        }
    }

    function _grantRole(bytes32 role, address account) internal {
        if (!_hasRole(role, account)) {
            accessStorage().roles[role][account] = true;
            emit RoleGranted(role, account, msg.sender);
        }
    }

    function _revokeRole(bytes32 role, address account) internal {
        if (_hasRole(role, account)) {
            accessStorage().roles[role][account] = false;
            emit RoleRevoked(role, account, msg.sender);
        }
    }
}
