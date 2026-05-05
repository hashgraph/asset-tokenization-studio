// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IPause } from "./IPause.sol";
import { Pause } from "./Pause.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _PAUSE_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title PauseFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that exposes pause management operations — pause, unpause, and pause
 *         state query — as selectable proxy functions.
 * @dev Inherits `Pause` for the business logic and implements `IStaticFunctionSelectors` for
 *      the Diamond resolver pattern. The resolver key `_PAUSE_RESOLVER_KEY` identifies this
 *      facet within the diamond proxy.
 */
contract PauseFacet is Pause, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _PAUSE_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](3);
        staticFunctionSelectors_[selectorIndex++] = this.pause.selector;
        staticFunctionSelectors_[selectorIndex++] = this.unpause.selector;
        staticFunctionSelectors_[selectorIndex++] = this.isPaused.selector;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IPause).interfaceId;
    }
}
