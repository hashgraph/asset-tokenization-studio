// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _PAUSE_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { _PAUSE_MANAGEMENT_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { IPauseStorageWrapper } from "./pause/IPauseStorageWrapper.sol";
import { IExternalPause } from "../../facets/layer_1/externalPause/IExternalPause.sol";
import { IInitializationErrors } from "../../services/IInitializationErrors.sol";
import {
    ExternalListManagementStorageWrapper,
    ExternalListDataStorage
} from "./ExternalListManagementStorageWrapper.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

struct PauseDataStorage {
    bool paused;
}

/**
 * @title PauseStorageWrapper
 * @dev Library providing pause storage operations with Diamond Storage Pattern
 *
 * This library uses ERC-2535 Diamond Storage Pattern to store pause data in a specific storage slot.
 * It provides storage operations, read functions, and state checks for pause functionality.
 *
 * @notice Use PauseModifiers for modifiers, or call functions directly
 * @author Asset Tokenization Studio Team
 */
library PauseStorageWrapper {
    using EnumerableSet for EnumerableSet.AddressSet;

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

    // --- Read functions ---

    // solhint-disable-next-line ordering
    function isPaused() internal view returns (bool) {
        return pauseStorage().paused || isExternallyPaused();
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

    // --- Guard functions for modifiers ---

    function _checkUnpaused() internal view {
        if (isPaused()) revert IPauseStorageWrapper.TokenIsPaused();
    }

    function _checkPaused() internal view {
        if (!isPaused()) revert IPauseStorageWrapper.TokenIsUnpaused();
    }

    function _checkNotExternalPauseInitialized() internal view {
        if (isExternalPauseInitialized()) {
            revert IInitializationErrors.AlreadyInitialized(true);
        }
    }
}
