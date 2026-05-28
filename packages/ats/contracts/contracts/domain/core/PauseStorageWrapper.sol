// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IExternalPause } from "../../facets/layer_1/externalPause/IExternalPause.sol";
import { IPause } from "../../facets/pause/IPause.sol";
import {
    ExternalListManagementStorageWrapper,
    ExternalListDataStorage
} from "./ExternalListManagementStorageWrapper.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

/// @custom:hash storage PauseManagement
bytes32 constant STORAGE_LOCATION_PAUSE_MANAGEMENT = 0x930ab19e093b9d470c1f7056ddf51dcaf1bdf62558a355b33b78972be23e2500;

/// @custom:hash storage Pause
bytes32 constant STORAGE_LOCATION_PAUSE = 0x3bf57dcdaf5f1e5afff95a10b7216bcff83f9e35b273e271675d9ef0c0621100;

/**
 * @notice Storage layout backing the internal pause flag of the token.
 * @dev The external-pause registry, which records the optional list of `IExternalPause` contracts
 *      that can also gate transfers, lives under `STORAGE_LOCATION_PAUSE_MANAGEMENT` and is held in
 *      the shared `ExternalListDataStorage` namespace operated by `ExternalListManagementStorageWrapper`.
 *      New fields must be appended below the APPEND-ONLY marker to preserve upgrade safety.
 * @custom:storage-location erc7201:security.token.standard.storage.Pause
 */
struct PauseDataStorage {
    // ─── R1 Lifecycle (bool flags) ───────────────────────────
    bool paused;
    // ─── APPEND-ONLY ZONE BELOW ───
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

    /**
     * @notice Sets the internal paused flag for the token.
     * @dev Does not affect the external-pause registry; callers requiring a combined check must
     *      use `isPaused`.
     * @param _paused New value of the internal paused flag.
     */
    function setPause(bool _paused) internal {
        pauseStorage().paused = _paused;
    }

    /**
     * @notice Initialises the external-pause registry with `_pauses` and marks it initialised.
     * @dev Each address is validated and added to the `STORAGE_LOCATION_PAUSE_MANAGEMENT` external
     *      list. Gas cost scales linearly with `_pauses.length`.
     * @param _pauses External `IExternalPause` contracts to register.
     */
    function initializeExternalPauses(address[] calldata _pauses) internal {
        uint256 length = _pauses.length;
        for (uint256 index; index < length; ) {
            ExternalListManagementStorageWrapper.checkValidAddress(_pauses[index]);
            ExternalListManagementStorageWrapper.addExternalList(STORAGE_LOCATION_PAUSE_MANAGEMENT, _pauses[index]);
            unchecked {
                ++index;
            }
        }
    }

    /**
     * @notice Reports whether the token is paused, considering both the internal flag and any
     *         registered external pause contracts.
     * @return True when the internal flag is set or any external pause reports paused.
     */
    function isPaused() internal view returns (bool) {
        return pauseStorage().paused || isExternallyPaused();
    }

    /**
     * @notice Reports whether any registered external pause contract is currently paused.
     * @dev Iterates the `STORAGE_LOCATION_PAUSE_MANAGEMENT` external list, short-circuiting on the
     *      first paused entry. Gas cost is bounded by the number of registered external pauses.
     * @return True when at least one external pause reports paused; false otherwise.
     */
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

    /**
     * @notice Reverts with `IPause.IsPaused` when the token is currently paused.
     * @dev Combined internal and external pause check; intended as a precondition guard for state
     *      mutations that must not run while paused.
     */
    function checkUnpaused() internal view {
        if (isPaused()) revert IPause.IsPaused();
    }

    /**
     * @notice Reverts with `IPause.IsPaused` when the internal pause flag is set.
     * @dev Intentionally ignores external pause contracts. Used by `removeExternalPause` so that a
     *      permanently-paused external contract cannot create a deadlock (FIND-016): the manager can
     *      still remove it as long as the token has not been paused internally.
     */
    function checkNotInternallyPaused() internal view {
        if (pauseStorage().paused) revert IPause.IsPaused();
    }

    /**
     * @notice Reverts with `IPause.IsUnpaused` when the token is not currently paused.
     * @dev Used by flows that may only execute while the token is paused.
     */
    function checkPaused() internal view {
        if (!isPaused()) revert IPause.IsUnpaused();
    }

    /**
     * @notice Returns the storage pointer for the internal pause namespace.
     * @dev Resolves the ERC-7201 slot via inline assembly to obtain a struct reference at
     *      `STORAGE_LOCATION_PAUSE`.
     * @return pause_ Storage reference to the `PauseDataStorage` struct.
     */
    function pauseStorage() internal pure returns (PauseDataStorage storage pause_) {
        bytes32 position = STORAGE_LOCATION_PAUSE;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            pause_.slot := position
        }
    }
}
