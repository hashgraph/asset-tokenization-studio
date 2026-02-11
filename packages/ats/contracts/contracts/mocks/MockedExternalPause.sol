// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IExternalPause } from "../layer_1/interfaces/externalPauses/IExternalPause.sol";

contract MockedExternalPause is IExternalPause {
    bool private _paused;

    event PausedStateChanged(bool isPaused);

    function setPaused(bool paused) external {
        _paused = paused;
        emit PausedStateChanged(paused);
    }

    function isPaused() external view override returns (bool) {
        return _paused;
    }
}
