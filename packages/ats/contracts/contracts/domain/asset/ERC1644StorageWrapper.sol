// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _ERC1644_STORAGE_POSITION } from "../../constants/storagePositions.sol";
import { IERC1644 } from "../../facets/layer_1/ERC1400/ERC1644/IERC1644.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";

/**
 * @notice Diamond Storage struct for ERC1644 controller operation state.
 * @dev    Stored at `_ERC1644_STORAGE_POSITION`. `isControllable` is set at
 *         initialisation and may be permanently disabled via `finalizeControllable`;
 *         once set to `false` it cannot be re-enabled by this library. `initialized`
 *         guards against uninitialised reads.
 * @param isControllable  True if controller operations are currently permitted on the
 *                        token.
 * @param initialized     True once `initialize_ERC1644` has been called.
 */
struct ERC1644Storage {
    bool isControllable;
    bool initialized;
}

/**
 * @title  ERC1644StorageWrapper
 * @notice Internal library providing storage operations for ERC1644 controller token
 *         functionality, governing whether privileged controller transfers and
 *         redemptions are permitted.
 * @dev    Anchors `ERC1644Storage` at `_ERC1644_STORAGE_POSITION` following the
 *         ERC-2535 Diamond Storage Pattern. All functions are `internal` and intended
 *         exclusively for use within facets or other internal libraries of the same
 *         diamond.
 *
 *         The controllable flag follows a one-way lifecycle: it may be set to either
 *         `true` or `false` at initialisation, but `finalizeControllable` permanently
 *         disables it and emits an irreversible event. No function in this library
 *         re-enables controllability once finalised.
 * @author Hashgraph
 */
library ERC1644StorageWrapper {
    /**
     * @notice Initialises the ERC1644 subsystem with the specified controllability
     *         setting and marks the storage as initialised.
     * @dev    Calling this more than once overwrites `isControllable` and re-sets
     *         `initialized`; callers must enforce single-initialisation at the facet
     *         level. Does not emit an event.
     * @param _controllable  True to enable controller operations; false to disable them
     *                       from the outset.
     */
    // solhint-disable-next-line func-name-mixedcase
    function initialize_ERC1644(bool _controllable) internal {
        erc1644Storage().isControllable = _controllable;
        erc1644Storage().initialized = true;
    }

    /**
     * @notice Permanently disables controller operations for the token and emits
     *         `IERC1644.FinalizedControllerFeature`.
     * @dev    Sets `isControllable` to `false` irreversibly within this library. After
     *         this call, `requireControllable` will always revert and `isControllable`
     *         will always return `false`. Callers are responsible for any access control
     *         enforcement before invoking this function.
     *         Emits: `IERC1644.FinalizedControllerFeature`.
     */
    function finalizeControllable() internal {
        erc1644Storage().isControllable = false;
        emit IERC1644.FinalizedControllerFeature(EvmAccessors.getMsgSender());
    }

    /**
     * @notice Reverts if controller operations are not currently enabled.
     * @dev    Use as a guard at the entry point of any controller-privileged function.
     *         Reverts with `IERC1644.TokenIsNotControllable` if `isControllable` is
     *         `false`, including after `finalizeControllable` has been called.
     */
    function requireControllable() internal view {
        if (!isControllable()) revert IERC1644.TokenIsNotControllable();
    }

    /**
     * @notice Returns whether controller operations are currently permitted on the token.
     * @dev    Returns `false` both when the token was initialised with controllability
     *         disabled and after `finalizeControllable` has been called.
     * @return True if controller operations are enabled; false otherwise.
     */
    function isControllable() internal view returns (bool) {
        return erc1644Storage().isControllable;
    }

    /**
     * @notice Returns whether the ERC1644 subsystem has been initialised.
     * @dev    Returns `false` until `initialize_ERC1644` has been called. A `false`
     *         return indicates that `isControllable` is in its default uninitialised
     *         state.
     * @return True if `initialize_ERC1644` has been called at least once; false
     *         otherwise.
     */
    function isERC1644Initialized() internal view returns (bool) {
        return erc1644Storage().initialized;
    }

    /**
     * @notice Returns the Diamond Storage pointer for `ERC1644Storage`.
     * @dev    Uses inline assembly to position the struct at the deterministic slot
     *         defined by `_ERC1644_STORAGE_POSITION`, following the ERC-2535 Diamond
     *         Storage Pattern. Slot isolation prevents collisions with other facet
     *         storage structs in the same proxy. Must only be called from within this
     *         library.
     * @return erc1644Storage_  Storage pointer to the `ERC1644Storage` struct.
     */
    function erc1644Storage() private pure returns (ERC1644Storage storage erc1644Storage_) {
        bytes32 position = _ERC1644_STORAGE_POSITION;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            erc1644Storage_.slot := position
        }
    }
}
