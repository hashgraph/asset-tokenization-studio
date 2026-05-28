// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IController } from "../../facets/controller/IController.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";

/// @custom:hash storage Erc1644
bytes32 constant STORAGE_LOCATION_ERC1644 = 0x96356235f59c9d131a29a98816b8ce8d9e8a5aa2b64c6d01293c66354dba3000;

/**
 * @notice ERC-1644 controllable-token storage layout.
 * @dev Persists the runtime controllable flag alongside the initialisation marker. Both are
 *      single-bit lifecycle flags so the struct fits in slot 0 with room for future
 *      append-only additions.
 * @custom:storage-location erc7201:security.token.standard.storage.Erc1644
 */
struct ERC1644Storage {
    // ─── R1 Lifecycle (bool flags) ───────────────────────────
    bool isControllable;

    // ─── APPEND-ONLY ZONE BELOW ───
}

/**
 * @title ERC1644StorageWrapper
 * @author Asset Tokenization Studio Team
 * @notice Storage accessors and writes for the ERC-1644 controllable-token feature.
 * @dev Reads and writes the dedicated storage slot defined by `STORAGE_LOCATION_ERC1644`.
 *      The controllable flag may be finalised once via `finalizeControllable`, after which
 *      it cannot be re-enabled.
 */
library ERC1644StorageWrapper {
    /**
     * @notice Initialises the ERC-1644 storage with the supplied controllable flag.
     * @dev Sets `initialized` to `true`; must be called exactly once during deployment.
     * @param _controllable Whether the token is controllable at deployment time.
     */
    // solhint-disable-next-line func-name-mixedcase
    function initializeController(bool _controllable) internal {
        erc1644Storage().isControllable = _controllable;
    }

    /**
     * @notice Permanently disables the controllable feature.
     * @dev Emits `FinalizedControllerFeature`. After this call `isControllable` always
     *      returns `false`; there is no path to re-enable.
     */
    function finalizeControllable() internal {
        erc1644Storage().isControllable = false;
        emit IController.FinalizedControllerFeature(EvmAccessors.getMsgSender());
    }

    /**
     * @notice Reverts unless the token is currently controllable.
     * @dev Used by controller-gated facet entry points to short-circuit non-controllable tokens.
     */
    function requireControllable() internal view {
        if (!isControllable()) revert IController.TokenIsNotControllable();
    }

    /**
     * @notice Returns whether the token is currently controllable.
     * @return `true` while the controllable feature is active.
     */
    function isControllable() internal view returns (bool) {
        return erc1644Storage().isControllable;
    }

    /**
     * @notice Returns the storage pointer for the ERC-1644 namespace.
     * @dev Resolves the dedicated EIP-2535 storage slot via inline assembly.
     * @return erc1644Storage_ Storage reference to the `ERC1644Storage` struct.
     */
    function erc1644Storage() internal pure returns (ERC1644Storage storage erc1644Storage_) {
        bytes32 position = STORAGE_LOCATION_ERC1644;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            erc1644Storage_.slot := position
        }
    }
}
