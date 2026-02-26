// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _PAUSE_STORAGE_POSITION } from "../constants/storagePositions.sol";

/// @dev Pause state storage
struct PauseDataStorage {
    bool paused;
}

/// @dev Access pause storage
function pauseStorage() pure returns (PauseDataStorage storage ps) {
    bytes32 pos = _PAUSE_STORAGE_POSITION;
    // solhint-disable-next-line no-inline-assembly
    assembly {
        ps.slot := pos
    }
}
