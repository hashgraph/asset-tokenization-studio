// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBatchController, RESOLVER_KEY_BATCH_CONTROLLER } from "./IBatchController.sol";
import { BatchController } from "./BatchController.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
/**
 * @title BatchControllerFacet
 * @notice Diamond facet exposing controller-only batch transfer operations.
 * @dev Registers the `batchForcedTransfer` selector. Inherits business logic from the
 *      `BatchController` abstract contract.
 */
contract BatchControllerFacet is BatchController, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_BATCH_CONTROLLER;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(this.initializeBatchController.selector, this.batchForcedTransfer.selector);
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IBatchController).interfaceId);
    }
}
