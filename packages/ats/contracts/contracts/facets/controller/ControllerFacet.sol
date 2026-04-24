// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IController } from "./IController.sol";
import { Controller } from "./Controller.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _CONTROLLER_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

/**
 * @title ControllerFacet
 * @notice Diamond facet exposing ERC-1644 forced-transfer operations and ERC-3643 agent management.
 * @dev Registers nine selectors: initializeController, isControllable, controllerTransfer,
 *      controllerRedeem, finalizeControllable, forcedTransfer, addAgent, removeAgent, and isAgent.
 *      Inherits all business logic from the Controller abstract contract.
 */
contract ControllerFacet is Controller, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _CONTROLLER_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex = 9;
        staticFunctionSelectors_ = new bytes4[](selectorIndex);
        unchecked {
            staticFunctionSelectors_[--selectorIndex] = this.isAgent.selector;
            staticFunctionSelectors_[--selectorIndex] = this.removeAgent.selector;
            staticFunctionSelectors_[--selectorIndex] = this.addAgent.selector;
            staticFunctionSelectors_[--selectorIndex] = this.forcedTransfer.selector;
            staticFunctionSelectors_[--selectorIndex] = this.finalizeControllable.selector;
            staticFunctionSelectors_[--selectorIndex] = this.controllerRedeem.selector;
            staticFunctionSelectors_[--selectorIndex] = this.controllerTransfer.selector;
            staticFunctionSelectors_[--selectorIndex] = this.isControllable.selector;
            staticFunctionSelectors_[--selectorIndex] = this.initializeController.selector;
        }
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        staticInterfaceIds_[0] = type(IController).interfaceId;
    }
}
