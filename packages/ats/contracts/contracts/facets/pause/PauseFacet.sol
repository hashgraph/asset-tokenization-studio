// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IPause, RESOLVER_KEY_PAUSE } from "./IPause.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
import { PauseOperational } from "./PauseOperational.sol";

/**
 * @title PauseFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that exposes pause management operations — pause, unpause, and pause
 *         state query — as selectable proxy functions.
 * @dev Inherits `Pause` for the business logic and implements `IStaticFunctionSelectors` for
 *      the Diamond resolver pattern. The resolver key `RESOLVER_KEY_PAUSE` identifies this
 *      facet within the diamond proxy.
 */
contract PauseFacet is PauseOperational, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_PAUSE;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return
            Bytes4Builder.build(
                this.initializePause.selector,
                this.pause.selector,
                this.unpause.selector,
                this.paused.selector
            );
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IPause).interfaceId);
    }
}
