// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBatchTransfer, RESOLVER_KEY_BATCH_TRANSFER } from "./IBatchTransfer.sol";
import { BatchTransfer } from "./BatchTransfer.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
/**
 * @title BatchTransferFacet
 * @notice Diamond facet that exposes the batch transfer capability through the `IBatchTransfer`
 *         interface, registered under `RESOLVER_KEY_BATCH_TRANSFER`.
 * @dev Inherits transfer logic from `BatchTransfer` and satisfies the `IStaticFunctionSelectors`
 *      contract required by the Diamond proxy for selector registration. Exposes one selector:
 *      `batchTransfer`.
 * @author Asset Tokenization Studio Team
 */
contract BatchTransferFacet is BatchTransfer, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_BATCH_TRANSFER;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(this.initializeBatchTransfer.selector, this.batchTransfer.selector);
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IBatchTransfer).interfaceId);
    }
}
