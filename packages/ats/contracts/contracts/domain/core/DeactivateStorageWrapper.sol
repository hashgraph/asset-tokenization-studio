// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IDeactivate } from "../../facets/deactivate/IDeactivate.sol";

/// @custom:hash storage Deactivate
bytes32 constant STORAGE_LOCATION_DEACTIVATE = 0x572f1b7cd92e0f948542520f56d2d4ecc670fb13e750315c85e1e1a4e5be0100;

/**
 * @notice Storage layout for the deactivation flag.
 * @dev Persisted at the dedicated diamond storage slot `STORAGE_LOCATION_DEACTIVATE` to avoid
 *      collisions with other facets. Single-field struct kept for forward compatibility — any
 *      future deactivation metadata (operator, timestamp, reason) can be appended without
 *      changing the slot.
 * @param deactivated True once the token has been deactivated; transitions are one-way.
 */
struct DeactivateDataStorage {
    bool deactivated;
}

/**
 * @title DeactivateStorageWrapper
 * @author Asset Tokenization Studio Team
 * @notice Library providing read, write, and guard operations for the token deactivation flag
 *         using the ERC-2535 Diamond Storage Pattern.
 * @dev Resolves the storage struct from `STORAGE_LOCATION_DEACTIVATE` via inline assembly.
 *      State writes are intentionally one-way — there is no reactivation primitive. Use
 *      `DeactivateModifiers.onlyActivated` for guards instead of calling `requireActivated`
 *      directly, except where a modifier cannot be applied.
 */
library DeactivateStorageWrapper {
    /**
     * @notice Sets the deactivation flag to `true`, retiring the token irreversibly.
     * @dev No-op semantics if the flag is already set. Callers must enforce access control and
     *      idempotency upstream (see the `Deactivate` facet, which gates this with
     *      `onlyActivated`).
     */
    function deactivate() internal {
        deactivateStorage().deactivated = true;
    }

    /**
     * @notice Reads the current deactivation flag.
     * @return True if the token has been deactivated, false otherwise.
     */
    function isDeactivated() internal view returns (bool) {
        return deactivateStorage().deactivated;
    }

    /**
     * @notice Reverts with `IDeactivate.Deactivated` if the token has been deactivated.
     * @dev Backing implementation of the `onlyActivated` modifier; usable directly in flows
     *      where a modifier cannot be applied.
     */
    function requireActivated() internal view {
        if (isDeactivated()) revert IDeactivate.Deactivated();
    }

    /**
     * @notice Resolves the deactivation storage struct at its diamond storage slot.
     * @dev Uses inline assembly to bind the struct pointer to `STORAGE_LOCATION_DEACTIVATE`.
     *      Marked `pure` because slot resolution does not read or write state directly; the
     *      returned reference is the entry point for read/write helpers in this library.
     * @return deactivate_ Storage reference to the `DeactivateDataStorage` struct.
     */
    function deactivateStorage() internal pure returns (DeactivateDataStorage storage deactivate_) {
        bytes32 position = STORAGE_LOCATION_DEACTIVATE;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            deactivate_.slot := position
        }
    }
}
