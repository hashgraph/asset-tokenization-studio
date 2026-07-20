// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IPause, RESOLVER_KEY_PAUSE } from "./IPause.sol";
import { PauseRead } from "./PauseRead.sol";
import { ROLE_PAUSER, DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { PauseStorageWrapper } from "../../domain/core/PauseStorageWrapper.sol";
import { EvmAccessors } from "../../infrastructure/utils/EvmAccessors.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";

/**
 * @title PauseOperational
 * @author Asset Tokenization Studio Team
 * @notice Variant of Pause for proxy facets only. Identical to Pause except pause() and
 *         unpause() also require onlyOperational and onlyActivated, since token proxies (unlike
 *         direct-inheritance consumers such as DiamondCutManager) can be non-operational or
 *         deactivated. Use Pause (without these two checks) for direct-inheritance consumers
 *         that do not operate through the ResolverProxy pattern.
 * @dev Implements `IPause`. Intended to be inherited exclusively by `PauseFacet`.
 */
abstract contract PauseOperational is PauseRead {
    /// @inheritdoc IPause
    function initializePause()
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyFacetNotRegistered(RESOLVER_KEY_PAUSE)
    {
        InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_PAUSE);
        emit PauseInitialized();
    }

    /// @inheritdoc IPause
    function pause()
        external
        override
        onlyOperational
        onlyActivated
        onlyUnpaused
        onlyRole(ROLE_PAUSER)
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
        onlyRole(ROLE_PAUSER)
        onlyPaused
        returns (bool success_)
    {
        PauseStorageWrapper.setPause(false);
        emit IPause.Unpaused(EvmAccessors.getMsgSender());
        success_ = true;
    }
}
