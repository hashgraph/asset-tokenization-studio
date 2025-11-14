// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IPauseStorageWrapper } from "../../../layer_1/interfaces/pause/IPauseStorageWrapper.sol";
import { _PAUSE_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { ExternalPauseManagementStorageWrapper } from "../externalPauses/ExternalPauseManagementStorageWrapper.sol";

abstract contract PauseStorageWrapper is IPauseStorageWrapper, ExternalPauseManagementStorageWrapper {
    struct PauseDataStorage {
        bool paused;
    }

    // modifiers
    modifier onlyPaused() {
        _checkPaused();
        _;
    }

    modifier onlyUnpaused() {
        _checkUnpaused();
        _;
    }

    // Internal
    function _setPause(bool _paused) internal {
        _pauseStorage().paused = _paused;
        if (_paused) {
            emit TokenPaused(_msgSender());
            return;
        }
        emit TokenUnpaused(_msgSender());
    }

    function _isPaused() internal view returns (bool) {
        return (_pauseStorage().paused || _isExternallyPaused());
    }

    function _checkUnpaused() internal view {
        if (_isPaused()) {
            revert TokenIsPaused();
        }
    }

    function _pauseStorage() internal pure virtual returns (PauseDataStorage storage pause_) {
        bytes32 position = _PAUSE_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            pause_.slot := position
        }
    }

    function _checkPaused() private view {
        if (!_isPaused()) {
            revert TokenIsUnpaused();
        }
    }
}
