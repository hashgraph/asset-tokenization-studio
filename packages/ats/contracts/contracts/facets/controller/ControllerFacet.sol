// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IController, RESOLVER_KEY_CONTROLLER } from "./IController.sol";
import { Controller } from "./Controller.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";
/**
 * @title ControllerFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet exposing ERC-1644 forced-transfer operations and ERC-3643 agent management.
 * @dev Registers nine selectors: initializeController, isControllable, controllerTransfer,
 *      controllerRedeem, finalizeControllable, forcedTransfer, addAgent, removeAgent, and isAgent.
 *      Inherits all business logic from the Controller abstract contract.
 */
contract ControllerFacet is Controller, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_CONTROLLER;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return
            Bytes4Builder.build(
                this.initializeController.selector,
                this.isControllable.selector,
                this.controllerTransfer.selector,
                this.controllerRedeem.selector,
                this.finalizeControllable.selector,
                this.forcedTransfer.selector,
                this.addAgent.selector,
                this.removeAgent.selector,
                this.isAgent.selector
            );
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IController).interfaceId);
    }
}
