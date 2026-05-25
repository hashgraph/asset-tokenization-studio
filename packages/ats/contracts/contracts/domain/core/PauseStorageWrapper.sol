// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IExternalPause } from "../../facets/layer_1/externalPause/IExternalPause.sol";
import { IPause } from "../../facets/pause/IPause.sol";
import {
    ExternalListManagementStorageWrapper,
    ExternalListDataStorage
} from "./ExternalListManagementStorageWrapper.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";

/// @custom:hash storage PauseManagement
bytes32 constant STORAGE_LOCATION_PAUSE_MANAGEMENT = 0x930ab19e093b9d470c1f7056ddf51dcaf1bdf62558a355b33b78972be23e2500;

/// @custom:hash storage Pause
bytes32 constant STORAGE_LOCATION_PAUSE = 0x3bf57dcdaf5f1e5afff95a10b7216bcff83f9e35b273e271675d9ef0c0621100;

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

    function pauseStorage() internal pure returns (PauseDataStorage storage pause_) {
        bytes32 position = STORAGE_LOCATION_PAUSE;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            pause_.slot := position
        }
    }

    // solhint-disable-next-line ordering
    function setPause(bool _paused) internal {
        pauseStorage().paused = _paused;
    }

    function initializeExternalPauses(address[] calldata _pauses) internal {
        uint256 length = _pauses.length;
        for (uint256 index; index < length; ) {
            ExternalListManagementStorageWrapper.checkValidAddress(_pauses[index]);
            ExternalListManagementStorageWrapper.addExternalList(STORAGE_LOCATION_PAUSE_MANAGEMENT, _pauses[index]);
            unchecked {
                ++index;
            }
        }
        ExternalListManagementStorageWrapper.setExternalListInitialized(STORAGE_LOCATION_PAUSE_MANAGEMENT);
    }

    // solhint-disable-next-line ordering
    function isPaused() internal view returns (bool) {
        return pauseStorage().paused || isExternallyPaused();
    }

    function isExternallyPaused() internal view returns (bool) {
        ExternalListDataStorage storage externalPauseDataStorage = ExternalListManagementStorageWrapper
            .externalListStorage(STORAGE_LOCATION_PAUSE_MANAGEMENT);
        uint256 length = ExternalListManagementStorageWrapper.getExternalListsCount(STORAGE_LOCATION_PAUSE_MANAGEMENT);
        for (uint256 index; index < length; ) {
            if (IExternalPause(externalPauseDataStorage.list.at(index)).isPaused()) return true;
            unchecked {
                ++index;
            }
        }
        return false;
    }

    function isExternalPauseInitialized() internal view returns (bool) {
        return ExternalListManagementStorageWrapper.externalListStorage(STORAGE_LOCATION_PAUSE_MANAGEMENT).initialized;
    }

    function checkUnpaused() internal view {
        if (isPaused()) revert IPause.IsPaused();
    }

    function checkPaused() internal view {
        if (!isPaused()) revert IPause.IsUnpaused();
    }
}
