// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "../../storage/ERC1410Storage.sol";

/**
 * NEW ARCHITECTURE - LibPause
 *
 * ONLY pause-related logic.
 * Single responsibility. Easy to find. Easy to audit.
 */
library LibPause {
    error EnforcedPause();
    error NotPaused();

    event Paused(address account);
    event Unpaused(address account);

    function paused() internal view returns (bool) {
        return pauseStorage().paused;
    }

    function requireNotPaused() internal view {
        if (pauseStorage().paused) revert EnforcedPause();
    }

    function requirePaused() internal view {
        if (!pauseStorage().paused) revert NotPaused();
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
