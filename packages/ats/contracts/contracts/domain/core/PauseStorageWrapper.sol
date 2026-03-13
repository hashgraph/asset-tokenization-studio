// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _PAUSE_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { _PAUSE_MANAGEMENT_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { IPauseStorageWrapper } from "./pause/IPauseStorageWrapper.sol";
import { IExternalPause } from "../../facets/layer_1/externalPause/IExternalPause.sol";
import {
    ExternalListManagementStorageWrapper,
    ExternalListDataStorage
} from "./ExternalListManagementStorageWrapper.sol";

struct PauseDataStorage {
    bool paused;
}

library PauseStorageWrapper {
    // --- Storage accessor (pure) ---

    function pauseStorage() internal pure returns (PauseDataStorage storage pause_) {
        bytes32 position = _PAUSE_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            pause_.slot := position
        }
    }

    // --- State-changing functions ---

    // solhint-disable-next-line ordering
    function setPause(bool _paused) internal {
        pauseStorage().paused = _paused;
        if (_paused) {
            emit IPauseStorageWrapper.TokenPaused(msg.sender);
            return;
        }
        emit IPauseStorageWrapper.TokenUnpaused(msg.sender);
    }

    function isPaused() internal view returns (bool) {
        return pauseStorage().paused || isExternallyPaused();
    }

    function requireNotPaused() internal view {
        if (isPaused()) {
            revert IPauseStorageWrapper.TokenIsPaused();
        }
    }

    function requirePaused() internal view {
        if (!isPaused()) {
            revert IPauseStorageWrapper.TokenIsUnpaused();
        }
    }

    // --- External Pause Management ---

    // solhint-disable-next-line func-name-mixedcase
    function initialize_ExternalPauses(address[] calldata _pauses) internal {
        uint256 length = _pauses.length;
        for (uint256 index; index < length; ) {
            ExternalListManagementStorageWrapper.checkValidAddress(_pauses[index]);
            ExternalListManagementStorageWrapper.addExternalList(_PAUSE_MANAGEMENT_STORAGE_POSITION, _pauses[index]);
            unchecked {
                ++index;
            }
        }
        ExternalListManagementStorageWrapper.setExternalListInitialized(_PAUSE_MANAGEMENT_STORAGE_POSITION);
    }

    function isExternallyPaused() internal view returns (bool) {
        ExternalListDataStorage storage externalPauseDataStorage = ExternalListManagementStorageWrapper
            .externalListStorage(_PAUSE_MANAGEMENT_STORAGE_POSITION);
        uint256 length = ExternalListManagementStorageWrapper.getExternalListsCount(_PAUSE_MANAGEMENT_STORAGE_POSITION);
        for (uint256 index = 0; index < length; ) {
            if (IExternalPause(externalPauseDataStorage.list.at(index)).isPaused()) return true;
            unchecked {
                ++index;
            }
        }
        return false;
    }

    function isExternalPauseInitialized() internal view returns (bool) {
        return ExternalListManagementStorageWrapper.externalListStorage(_PAUSE_MANAGEMENT_STORAGE_POSITION).initialized;
    }
}
