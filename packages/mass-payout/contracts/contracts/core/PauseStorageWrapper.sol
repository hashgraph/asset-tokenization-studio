// SPDX-License-Identifier: Apache-2.0

pragma solidity 0.8.22;

import { IPauseStorageWrapper } from "./interfaces/IPauseStorageWrapper.sol";
import { LocalContext } from "../common/LocalContext.sol";
import { _PAUSE_STORAGE_POSITION } from "../constants/storagePositions.sol";

abstract contract PauseStorageWrapper is IPauseStorageWrapper, LocalContext {
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
            emit LifeCycleCashFlowPaused(_msgSender());
            return;
        }
        emit LifeCycleCashFlowUnpaused(_msgSender());
    }

    function _isPaused() internal view returns (bool) {
        return _pauseStorage().paused;
    }

    function _checkUnpaused() internal view {
        if (_isPaused()) {
            revert LifeCycleCashFlowIsPaused();
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
            revert LifeCycleCashFlowIsUnpaused();
        }
    }
}
