// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBatchFreeze } from "./IBatchFreeze.sol";
import { BatchFreeze } from "./BatchFreeze.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
import { _BATCH_FREEZE_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title BatchFreezeFacet
 * @notice Diamond facet that exposes batch freeze and unfreeze operations through the
 *         `IBatchFreeze` interface, registered under `_BATCH_FREEZE_RESOLVER_KEY`.
 * @dev Inherits batch logic from `BatchFreeze` and satisfies the `IStaticFunctionSelectors`
 *      contract required by the Diamond proxy for selector registration. Exposes three selectors:
 *      `batchSetAddressFrozen`, `batchFreezePartialTokens`, and `batchUnfreezePartialTokens`.
 */
contract BatchFreezeFacet is BatchFreeze, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _BATCH_FREEZE_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return
            Bytes4Builder.build(
                this.initializeBatchFreeze.selector,
                this.batchSetAddressFrozen.selector,
                this.batchFreezePartialTokens.selector,
                this.batchUnfreezePartialTokens.selector
            );
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IBatchFreeze).interfaceId);
    }
}
