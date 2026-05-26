// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IPause } from "./IPause.sol";
import { PauseRead } from "./PauseRead.sol";
import { PAUSER_ROLE } from "../../constants/roles.sol";
import { PauseStorageWrapper } from "../../domain/core/PauseStorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";
import { _PAUSE_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title PauseOperational
 * @author Asset Tokenization Studio Team
 * @notice Variant of Pause for proxy facets only. Identical to Pause except pause() and
 *         unpause() require onlyOperational as their first modifier. Use Pause (without
 *         onlyOperational) for direct-inheritance consumers such as DiamondCutManager that
 *         do not operate through the ResolverProxy pattern.
 * @dev Implements `IPause`. Intended to be inherited exclusively by `PauseFacet`.
 */
abstract contract PauseOperational is PauseRead {
    /// @inheritdoc IPause
    function initializePause()
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyFacetNotRegistered(_PAUSE_RESOLVER_KEY)
    {
        InitializerStorageWrapper.setFacetToReady(_PAUSE_RESOLVER_KEY);
        emit PauseInitialized();
    }

    /// @inheritdoc IPause
    function pause()
        external
        override
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlyRole(PAUSER_ROLE)
        returns (bool success_)
    {
        PauseStorageWrapper.setPause(true);
        emit IPause.Paused(EvmAccessors.getMsgSender());
        success_ = true;
    }

    /// @inheritdoc IPause
    function unpause()
        external
        override
        onlyOperational
        onlyActivated
        onlyRole(PAUSER_ROLE)
        onlyPaused
        returns (bool success_)
    {
        PauseStorageWrapper.setPause(false);
        emit IPause.Unpaused(EvmAccessors.getMsgSender());
        success_ = true;
    }
}
