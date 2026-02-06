// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "../internals/OldInternals.sol";
import "../../diamond/Interfaces.sol";

/**
 * OLD ARCHITECTURE - InitFacet
 *
 * Used once during deployment to initialize the diamond.
 * After initialization, this facet can be removed.
 *
 * Even though this is a one-time-use facet, it still inherits
 * ALL the code from OldInternals due to the inheritance pattern.
 */
contract OldInitFacet is OldInternals, IInitializableFacet {

    function initialize(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        address admin
    ) external override {
        // Initialize token metadata
        _initializeToken(name_, symbol_, decimals_);

        // Grant admin all roles
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
    }
}
