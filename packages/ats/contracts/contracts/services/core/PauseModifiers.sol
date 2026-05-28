// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { PauseStorageWrapper } from "../../domain/core/PauseStorageWrapper.sol";

/**
 * @title PauseModifiers
 * @author Asset Tokenization Studio Team
 * @notice Abstract contract providing pause-state precondition modifiers for security-token facets.
 * @dev Each modifier delegates to a `check*` helper in `PauseStorageWrapper` and reverts on
 *      violation. The combined pause state covers both the internal flag
 *      (`PauseDataStorage.paused`) and any registered external `IExternalPause` contracts.
 *      `onlyNotInternallyPaused` deliberately ignores external contracts so that a permanently
 *      paused external contract cannot deadlock management operations that remove it from the
 *      registry.
 */
abstract contract PauseModifiers {
    /// @notice Reverts with `IPause.IsPaused` when the token is paused by either the internal
    ///         flag or any registered external pause contract.
    modifier onlyUnpaused() {
        PauseStorageWrapper.checkUnpaused();
        _;
    }

    /// @notice Reverts with `IPause.IsUnpaused` when the token is not currently paused (by
    ///         either the internal flag or any registered external pause contract).
    modifier onlyPaused() {
        PauseStorageWrapper.checkPaused();
        _;
    }

    /// @notice Reverts with `IPause.IsPaused` only when the internal pause flag is set.
    /// @dev Intentionally ignores external pause contracts so that a permanently-reporting
    ///      external contract cannot block its own removal from the registry.
    modifier onlyNotInternallyPaused() {
        PauseStorageWrapper.checkNotInternallyPaused();
        _;
    }
}
