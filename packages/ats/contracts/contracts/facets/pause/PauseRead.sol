// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IPause } from "./IPause.sol";
import { PauseStorageWrapper } from "../../domain/core/PauseStorageWrapper.sol";
import { Modifiers } from "../../services/Modifiers.sol";

/**
 * @title PauseRead
 * @notice Read-only base for Pause and PauseOperational.
 *         Implements the paused() view function of IPause. Write functions are
 *         implemented by subclasses with or without onlyOperational depending on
 *         whether the consumer is a proxy facet or a direct-inheritance contract.
 */
abstract contract PauseRead is IPause, Modifiers {
    /// @inheritdoc IPause
    function paused() external view override returns (bool) {
        return PauseStorageWrapper.isPaused();
    }
}
