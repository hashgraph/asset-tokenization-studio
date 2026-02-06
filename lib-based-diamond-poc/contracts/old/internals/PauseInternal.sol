// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "../../diamond/DiamondStorage.sol";

/**
 * OLD ARCHITECTURE - PauseInternal
 *
 * This file is part of the "inheritance monster" pattern.
 * Every facet that needs pause functionality must inherit this,
 * which then gets compiled into EVERY facet's bytecode.
 */
abstract contract PauseInternal {
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
    // MODIFIERS
    // =========================================================================
    modifier whenNotPaused() {
        _requireNotPaused();
        _;
    }

    modifier whenPaused() {
        _requirePaused();
        _;
    }

    // =========================================================================
    // INTERNAL FUNCTIONS
    // =========================================================================
    function _paused() internal view returns (bool) {
        return pauseStorage().paused;
    }

    function _pause() internal {
        pauseStorage().paused = true;
        emit Paused(msg.sender);
    }

    function _unpause() internal {
        pauseStorage().paused = false;
        emit Unpaused(msg.sender);
    }

    function _requireNotPaused() internal view {
        if (_paused()) revert EnforcedPause();
    }

    function _requirePaused() internal view {
        if (!_paused()) revert ExpectedPause();
    }
}
