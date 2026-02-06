// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "../../diamond/DiamondStorage.sol";

/**
 * NEW ARCHITECTURE - LibAccess
 *
 * A focused library containing ONLY access control logic.
 *
 * Benefits:
 * 1. Single responsibility - only access control here
 * 2. Easy to audit - all permission logic in one place
 * 3. No diamond inheritance to understand
 * 4. Clear, explicit imports in facets
 * 5. Easy to test in isolation
 */
library LibAccess {
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
    // FUNCTIONS
    // =========================================================================
    function hasRole(bytes32 role, address account) internal view returns (bool) {
        return accessStorage().roles[role][account];
    }

    function checkRole(bytes32 role) internal view {
        checkRole(role, msg.sender);
    }

    function checkRole(bytes32 role, address account) internal view {
        if (!hasRole(role, account)) {
            revert AccessControlUnauthorizedAccount(account, role);
        }
    }

    function grantRole(bytes32 role, address account) internal {
        if (!hasRole(role, account)) {
            accessStorage().roles[role][account] = true;
            emit RoleGranted(role, account, msg.sender);
        }
    }

    function revokeRole(bytes32 role, address account) internal {
        if (hasRole(role, account)) {
            accessStorage().roles[role][account] = false;
            emit RoleRevoked(role, account, msg.sender);
        }
    }
}
