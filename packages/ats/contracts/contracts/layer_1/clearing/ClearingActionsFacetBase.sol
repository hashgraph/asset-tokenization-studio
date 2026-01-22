// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IClearingActions } from "../interfaces/clearing/IClearingActions.sol";
import { ClearingActions } from "./ClearingActions.sol";
import { IStaticFunctionSelectors } from "../../interfaces/resolver/resolverProxy/IStaticFunctionSelectors.sol";

abstract contract ClearingActionsFacetBase is ClearingActions, IStaticFunctionSelectors {
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](7);
        staticFunctionSelectors_[selectorIndex++] = this.initializeClearing.selector;
        staticFunctionSelectors_[selectorIndex++] = this.activateClearing.selector;
        staticFunctionSelectors_[selectorIndex++] = this.deactivateClearing.selector;
        staticFunctionSelectors_[selectorIndex++] = this.approveClearingOperationByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.cancelClearingOperationByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.reclaimClearingOperationByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.isClearingActivated.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IClearingActions).interfaceId;
    }
}
