// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _PAUSE_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { _PAUSE_MANAGEMENT_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { IPause } from "../../facets/layer_1/pause/IPause.sol";
import { ExternalListManagementStorageWrapper } from "./ExternalListManagementStorageWrapper.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";

/**
 * @notice Storage struct for pause state
 * @dev Holds the core pause state of the contract
 * @param paused Boolean indicating whether the contract is paused
 */
struct PauseDataStorage {
    bool paused;
}

/**
 * @title PauseStorageWrapper
 * @notice Library managing pause-related storage and logic using Diamond Storage Pattern
 * @dev Implements pause functionality using ERC-2535 Diamond Storage for modular contracts.
 *      Provides functions to check pause states, manage external pausers, and enforce pause conditions.
 * @author Hashgraph
 */
library PauseStorageWrapper {
    using EnumerableSet for EnumerableSet.AddressSet;

    /**
     * @notice Sets the pause state and emits corresponding event
     * @dev Mutates the pause state in storage and emits either TokenPaused or TokenUnpaused
     * @param _paused True to pause, false to unpause
     */
    function setPause(bool _paused) internal {
        pauseStorage().paused = _paused;
        if (_paused) {
            emit IPause.TokenPaused(EvmAccessors.getMsgSender());
            return;
        }
        emit IPause.TokenUnpaused(EvmAccessors.getMsgSender());
    }

    /**
     * @notice Initialises external pause contracts
     * @dev Adds valid external pause contract addresses to the external list management storage
     * @param _pauses Array of external pause contract addresses
     */
    function initializeExternalPauses(address[] calldata _pauses) internal {
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

    /**
     * @notice Checks if token is paused (internal or any external pause)
     * @dev Evaluates both internal pause state and all registered external pause contracts
     * @return True if paused internally or externally
     */
    function isPaused() internal view returns (bool) {
        return pauseStorage().paused || ExternalListManagementStorageWrapper.isExternallyPaused();
    }

    /**
     * @notice Reverts if token is paused
     * @dev Throws TokenIsPaused error if contract is currently paused
     */
    function _checkUnpaused() internal view {
        if (isPaused()) revert IPause.TokenIsPaused();
    }

    /**
     * @notice Reverts if token is not paused
     * @dev Throws TokenIsUnpaused error if contract is not currently paused
     */
    function _checkPaused() internal view {
        if (!isPaused()) revert IPause.TokenIsUnpaused();
    }

    /**
     * @notice Returns the PauseDataStorage storage pointer for the diamond storage position
     * @dev Uses inline assembly to access storage at predefined slot for pause data
     * @return pause_ Storage pointer to PauseDataStorage
     */
    function pauseStorage() private pure returns (PauseDataStorage storage pause_) {
        bytes32 position = _PAUSE_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            pause_.slot := position
        }
    }
}
