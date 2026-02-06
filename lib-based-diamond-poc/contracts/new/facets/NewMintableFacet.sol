// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "../../diamond/DiamondStorage.sol";
import "../../diamond/Interfaces.sol";
import "../libraries/LibToken.sol";
import "../libraries/LibAccess.sol";
import "../libraries/LibPause.sol";

/**
 * NEW ARCHITECTURE - MintableFacet
 *
 * LOOK AT THE IMPORTS!
 * - LibToken (for mint/burn)
 * - LibAccess (for role checking)
 * - LibPause (for pause checking)
 *
 * This facet imports EXACTLY what it needs.
 * No hidden functionality from inheritance.
 */
contract NewMintableFacet is IMintableFacet {

    function mint(address to, uint256 amount) external override {
        LibAccess.checkRole(MINTER_ROLE);
        LibPause.requireNotPaused();
        LibToken.mint(to, amount);
    }

    function burn(address from, uint256 amount) external override {
        LibAccess.checkRole(MINTER_ROLE);
        LibPause.requireNotPaused();
        LibToken.burn(from, amount);
    }
}
