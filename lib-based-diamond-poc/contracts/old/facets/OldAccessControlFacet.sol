// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "../internals/OldInternals.sol";
import "../../diamond/Interfaces.sol";

/**
 * OLD ARCHITECTURE - AccessControlFacet
 *
 * This facet ONLY needs access control logic.
 * But it inherits OldInternals, so it gets:
 * - ALL pause logic (not needed here)
 * - ALL token logic (not needed here)
 *
 * The bytecode bloat is significant.
 */
contract OldAccessControlFacet is OldInternals, IAccessControlFacet {

    function hasRole(bytes32 role, address account) external view override returns (bool) {
        return _hasRole(role, account);
    }

    function grantRole(bytes32 role, address account) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(role, account);
    }

    function revokeRole(bytes32 role, address account) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(role, account);
    }
}
