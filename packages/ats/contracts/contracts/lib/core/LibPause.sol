// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { pauseStorage } from "../../storage/PauseStorageAccessor.sol";
import { _PAUSE_MANAGEMENT_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { IExternalPause } from "../../facets/features/interfaces/IExternalPause.sol";
import { IPause } from "../../facets/features/interfaces/IPause.sol";
import { LibExternalLists } from "./LibExternalLists.sol";

/// @title LibPause — Pause control library
/// @notice Centralized pause functionality extracted from PauseStorageWrapper.sol
/// @dev Uses free function storage accessors from CoreStorage.sol, no inheritance
library LibPause {
    /// @dev Sets paused state to true and emits TokenPaused event
    function pause() internal {
        pauseStorage().paused = true;
        emit IPause.TokenPaused(msg.sender);
    }

    /// @dev Sets paused state to false and emits TokenUnpaused event
    function unpause() internal {
        pauseStorage().paused = false;
        emit IPause.TokenUnpaused(msg.sender);
    }

    /// @dev Returns true if token is paused (either directly or via external pause)
    function isPaused() internal view returns (bool) {
        return pauseStorage().paused || isExternallyPaused();
    }

    /// @dev Reverts if token is paused
    function requireNotPaused() internal view {
        if (isPaused()) {
            revert IPause.TokenIsPaused();
        }
    }

    /// @dev Reverts if token is not paused
    function requirePaused() internal view {
        if (!isPaused()) {
            revert IPause.TokenIsUnpaused();
        }
    }

    /// @dev Checks if any external pause contract reports paused state
    function isExternallyPaused() internal view returns (bool) {
        uint256 length = LibExternalLists.getExternalListsCount(_PAUSE_MANAGEMENT_STORAGE_POSITION);

        for (uint256 index = 0; index < length; ) {
            if (
                IExternalPause(LibExternalLists.getExternalListAt(_PAUSE_MANAGEMENT_STORAGE_POSITION, index)).isPaused()
            ) {
                return true;
            }
            unchecked {
                ++index;
            }
        }
        return false;
    }
}
