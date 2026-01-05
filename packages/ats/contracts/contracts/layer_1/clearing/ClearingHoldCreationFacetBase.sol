// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IClearingHoldCreation } from "../interfaces/clearing/IClearingHoldCreation.sol";
import { ClearingHoldCreation } from "./ClearingHoldCreation.sol";
import { IStaticFunctionSelectors } from "../../interfaces/resolver/resolverProxy/IStaticFunctionSelectors.sol";

abstract contract ClearingHoldCreationFacetBase is ClearingHoldCreation, IStaticFunctionSelectors {
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](5);
        staticFunctionSelectors_[selectorIndex++] = this.clearingCreateHoldByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.clearingCreateHoldFromByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.operatorClearingCreateHoldByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.protectedClearingCreateHoldByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getClearingCreateHoldForByPartition.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IClearingHoldCreation).interfaceId;
    }
}
