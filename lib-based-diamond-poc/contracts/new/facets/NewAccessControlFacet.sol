// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "../../diamond/DiamondStorage.sol";
import "../../diamond/Interfaces.sol";
import "../libraries/LibAccess.sol";

/**
 * NEW ARCHITECTURE - AccessControlFacet
 *
 * LOOK AT THE IMPORTS!
 * - LibAccess (for access control logic)
 *
 * NO PAUSE LOGIC IMPORTED!
 * NO TOKEN LOGIC IMPORTED!
 *
 * This facet only knows about access control.
 * It's explicit, focused, and easy to understand.
 */
contract NewAccessControlFacet is IAccessControlFacet {

    function hasRole(bytes32 role, address account) external view override returns (bool) {
        return LibAccess.hasRole(role, account);
    }

    function grantRole(bytes32 role, address account) external override {
        LibAccess.checkRole(DEFAULT_ADMIN_ROLE);
        LibAccess.grantRole(role, account);
    }

    function revokeRole(bytes32 role, address account) external override {
        LibAccess.checkRole(DEFAULT_ADMIN_ROLE);
        LibAccess.revokeRole(role, account);
    }
}
