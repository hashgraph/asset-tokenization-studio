// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "../../diamond/DiamondStorage.sol";

/**
 * NEW ARCHITECTURE - LibPause
 *
 * A focused library containing ONLY pause-related logic.
 *
 * Benefits:
 * 1. Single responsibility - only pause logic here
 * 2. Easy to find - all pause code in one file
 * 3. No inheritance chain to trace
 * 4. Facets import ONLY what they need
 * 5. Clear dependency graph
 *
 * Note: Internal library functions get INLINED by the compiler.
 * This means the bytecode is the same as inheritance, but the
 * SOURCE CODE organization is dramatically cleaner.
 */
library LibPause {
    // =========================================================================
    // ERRORS
    // =========================================================================
    error EnforcedPause();
    error ExpectedPause();

    // =========================================================================
    // EVENTS
    // =========================================================================
    event Paused(address account);
    event Unpaused(address account);

    // =========================================================================
    // FUNCTIONS
    // =========================================================================
    function paused() internal view returns (bool) {
        return pauseStorage().paused;
    }

    function pause() internal {
        pauseStorage().paused = true;
        emit Paused(msg.sender);
    }

    function unpause() internal {
        pauseStorage().paused = false;
        emit Unpaused(msg.sender);
    }

    function requireNotPaused() internal view {
        if (paused()) revert EnforcedPause();
    }

    function requirePaused() internal view {
        if (!paused()) revert ExpectedPause();
    }
}
