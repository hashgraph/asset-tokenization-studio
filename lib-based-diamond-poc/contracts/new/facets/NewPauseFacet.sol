// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "../../diamond/DiamondStorage.sol";
import "../../diamond/Interfaces.sol";
import "../libraries/LibPause.sol";
import "../libraries/LibAccess.sol";

/**
 * NEW ARCHITECTURE - PauseFacet
 *
 * LOOK AT THE IMPORTS!
 * - LibPause (for pause logic)
 * - LibAccess (for role checking)
 *
 * NO TOKEN LOGIC IMPORTED!
 * The facet explicitly declares its dependencies.
 *
 * Benefits:
 * 1. Clear dependency graph
 * 2. Easy to understand what this facet can do
 * 3. No hidden inherited functionality
 * 4. Easier to audit - just check the imports
 */
contract NewPauseFacet is IPauseFacet {

    function paused() external view override returns (bool) {
        return LibPause.paused();
    }

    function pause() external override {
        LibAccess.checkRole(PAUSER_ROLE);
        LibPause.requireNotPaused();
        LibPause.pause();
    }

    function unpause() external override {
        LibAccess.checkRole(PAUSER_ROLE);
        LibPause.requirePaused();
        LibPause.unpause();
    }
}
