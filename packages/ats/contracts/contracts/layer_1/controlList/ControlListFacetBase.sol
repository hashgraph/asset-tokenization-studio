// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IStaticFunctionSelectors } from "../../interfaces/resolver/resolverProxy/IStaticFunctionSelectors.sol";
import { ControlList } from "./ControlList.sol";
import { IControlList } from "../interfaces/controlList/IControlList.sol";

abstract contract ControlListFacetBase is ControlList, IStaticFunctionSelectors {
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](7);
        staticFunctionSelectors_[selectorIndex++] = this.initialize_ControlList.selector;
        staticFunctionSelectors_[selectorIndex++] = this.addToControlList.selector;
        staticFunctionSelectors_[selectorIndex++] = this.removeFromControlList.selector;
        staticFunctionSelectors_[selectorIndex++] = this.isInControlList.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getControlListType.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getControlListCount.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getControlListMembers.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IControlList).interfaceId;
    }
}
