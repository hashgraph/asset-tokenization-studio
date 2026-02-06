// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "../../storage/ERC1410Storage.sol";

/**
 * NEW ARCHITECTURE - LibAccess
 *
 * ONLY access control logic.
 * Single responsibility. Easy to find. Easy to audit.
 */
library LibAccess {
    error AccessControlUnauthorizedAccount(address account, bytes32 role);

    event RoleGranted(bytes32 indexed role, address indexed account);
    event RoleRevoked(bytes32 indexed role, address indexed account);

    function hasRole(bytes32 role, address account) internal view returns (bool) {
        return accessStorage().roles[role][account];
    }

    function checkRole(bytes32 role, address account) internal view {
        if (!hasRole(role, account)) {
            revert AccessControlUnauthorizedAccount(account, role);
        }
    }

    function grantRole(bytes32 role, address account) internal {
        accessStorage().roles[role][account] = true;
        emit RoleGranted(role, account);
    }

    function revokeRole(bytes32 role, address account) internal {
        accessStorage().roles[role][account] = false;
        emit RoleRevoked(role, account);
    }
}
