// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "../../diamond/DiamondStorage.sol";
import "../../diamond/Interfaces.sol";
import "../libraries/LibToken.sol";
import "../libraries/LibAccess.sol";

/**
 * NEW ARCHITECTURE - InitFacet
 *
 * Used once during deployment to initialize the diamond.
 *
 * LOOK AT THE IMPORTS!
 * - LibToken (for token initialization)
 * - LibAccess (for granting initial roles)
 *
 * NO PAUSE LOGIC IMPORTED!
 * (Initialization doesn't need pause checking)
 */
contract NewInitFacet is IInitializableFacet {

    function initialize(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        address admin
    ) external override {
        // Initialize token metadata
        LibToken.initialize(name_, symbol_, decimals_);

        // Grant admin all roles
        LibAccess.grantRole(DEFAULT_ADMIN_ROLE, admin);
        LibAccess.grantRole(PAUSER_ROLE, admin);
        LibAccess.grantRole(MINTER_ROLE, admin);
    }
}
