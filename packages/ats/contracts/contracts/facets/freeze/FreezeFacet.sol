// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IFreeze, RESOLVER_KEY_FREEZE } from "./IFreeze.sol";
import { Freeze } from "./Freeze.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
/**
 * @title FreezeFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that exposes freeze management operations — partial token freeze/unfreeze
 *         and address-level freeze toggling — as selectable proxy functions.
 * @dev Inherits `Freeze` for the business logic and implements `IStaticFunctionSelectors` for
 *      the Diamond resolver pattern. The resolver key `RESOLVER_KEY_FREEZE` identifies this
 *      facet within the diamond proxy.
 */
contract FreezeFacet is Freeze, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_FREEZE;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return
            Bytes4Builder.build(
                this.freezePartialTokens.selector,
                this.unfreezePartialTokens.selector,
                this.setAddressFrozen.selector,
                this.getFrozenTokens.selector,
                this.isFrozen.selector
            );
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IFreeze).interfaceId);
    }
}
