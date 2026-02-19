// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ExternalListDataStorage, pauseStorage, externalListStorage } from "../../storage/CoreStorage.sol";
import { _PAUSE_MANAGEMENT_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { IExternalPause } from "../../facets/features/interfaces/externalPauses/IExternalPause.sol";
import { IPauseStorageWrapper } from "../../facets/features/interfaces/pause/IPauseStorageWrapper.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

/// @title LibPause — Pause control library
/// @notice Centralized pause functionality extracted from PauseStorageWrapper.sol
/// @dev Uses free function storage accessors from CoreStorage.sol, no inheritance
library LibPause {
    using EnumerableSet for EnumerableSet.AddressSet;

    /// @dev Sets paused state to true and emits TokenPaused event
    function pause() internal {
        pauseStorage().paused = true;
        emit IPauseStorageWrapper.TokenPaused(msg.sender);
    }

    /// @dev Sets paused state to false and emits TokenUnpaused event
    function unpause() internal {
        pauseStorage().paused = false;
        emit IPauseStorageWrapper.TokenUnpaused(msg.sender);
    }

    /// @dev Returns true if token is paused (either directly or via external pause)
    function isPaused() internal view returns (bool) {
        return pauseStorage().paused || isExternallyPaused();
    }

    /// @dev Reverts if token is paused
    function requireNotPaused() internal view {
        if (isPaused()) {
            revert IPauseStorageWrapper.TokenIsPaused();
        }
    }

    /// @dev Reverts if token is not paused
    function requirePaused() internal view {
        if (!isPaused()) {
            revert IPauseStorageWrapper.TokenIsUnpaused();
        }
    }

    /// @dev Checks if any external pause contract reports paused state
    function isExternallyPaused() internal view returns (bool) {
        ExternalListDataStorage storage externalPauseDataStorage = externalListStorage(
            _PAUSE_MANAGEMENT_STORAGE_POSITION
        );
        uint256 length = externalPauseDataStorage.list.length();

        for (uint256 index = 0; index < length; ) {
            if (IExternalPause(externalPauseDataStorage.list.at(index)).isPaused()) {
                return true;
            }
            unchecked {
                ++index;
            }
        }
        return false;
    }
}
