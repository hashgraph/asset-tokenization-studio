pragma solidity 0.8.18;
// SPDX-License-Identifier: BSD-3-Clause-Attribution

import {LocalContext} from '../context/LocalContext.sol';
import {
    IPauseStorageWrapper
} from '../interfaces/pause/IPauseStorageWrapper.sol';
import {_PAUSE_STORAGE_POSITION} from '../constants/storagePositions.sol';

abstract contract PauseStorageWrapper is IPauseStorageWrapper, LocalContext {
    struct PauseDataStorage {
        bool paused;
    }

    // modifiers
    modifier onlyPaused() {
        if (!_isPaused()) {
            revert TokenIsUnpaused();
        }
        _;
    }

    modifier onlyUnpaused() {
        if (_isPaused()) {
            revert TokenIsPaused();
        }
        _;
    }

    // Internal
    function _setPause(bool _paused) internal virtual {
        _pauseStorage().paused = _paused;
        if (_paused) emit TokenPaused(_msgSender());
        else emit TokenUnpaused(_msgSender());
    }

    function _isPaused() internal view virtual returns (bool) {
        bool isPaused = _pauseStorage().paused;
        return isPaused;
    }

    function _pauseStorage()
        internal
        pure
        virtual
        returns (PauseDataStorage storage pause_)
    {
        bytes32 position = _PAUSE_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            pause_.slot := position
        }
    }
}
