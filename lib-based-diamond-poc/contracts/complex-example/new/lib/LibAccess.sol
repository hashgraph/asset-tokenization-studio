// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "../../storage/ComplexStorage.sol";

/// @title LibAccess — Role-based access control (42 lines of logic)
/// @notice Single responsibility: role management.
/// @dev No inheritance. No hidden dependencies.
library LibAccess {
    error AccessControlUnauthorizedAccount(address account, bytes32 role);
    event RoleGranted(bytes32 indexed role, address indexed account);
    event RoleRevoked(bytes32 indexed role, address indexed account);

    function hasRole(bytes32 role, address account) internal view returns (bool) {
        return accessStorage().roles[role][account];
    }

    function checkRole(bytes32 role) internal view {
        if (!hasRole(role, msg.sender)) {
            revert AccessControlUnauthorizedAccount(msg.sender, role);
        }
    }

    function grantRole(bytes32 role, address account) internal {
        if (!hasRole(role, account)) {
            accessStorage().roles[role][account] = true;
            accessStorage().roleMembers[role].push(account);
            emit RoleGranted(role, account);
        }
    }

    function revokeRole(bytes32 role, address account) internal {
        if (hasRole(role, account)) {
            accessStorage().roles[role][account] = false;
            emit RoleRevoked(role, account);
        }
    }
}
