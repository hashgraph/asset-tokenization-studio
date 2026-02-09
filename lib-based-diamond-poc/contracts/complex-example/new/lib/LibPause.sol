// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "../../storage/ComplexStorage.sol";

/// @title LibPause — Pause control (37 lines of logic)
/// @notice Single responsibility: pause/unpause the system.
/// @dev No inheritance. No hidden dependencies. Just pause.
library LibPause {
    error EnforcedPause();
    error NotPaused();
    event Paused(address account);
    event Unpaused(address account);

    function isPaused() internal view returns (bool) {
        return pauseStorage().paused;
    }

    function requireNotPaused() internal view {
        if (isPaused()) revert EnforcedPause();
    }

    function requirePaused() internal view {
        if (!isPaused()) revert NotPaused();
    }

    function pause() internal {
        pauseStorage().paused = true;
        emit Paused(msg.sender);
    }

    function unpause() internal {
        pauseStorage().paused = false;
        emit Unpaused(msg.sender);
    }
}
