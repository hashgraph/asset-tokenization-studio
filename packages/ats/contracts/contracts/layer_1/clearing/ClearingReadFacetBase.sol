// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IClearingRead } from "../interfaces/clearing/IClearingRead.sol";
import { ClearingRead } from "./ClearingRead.sol";
import { IStaticFunctionSelectors } from "../../interfaces/resolver/resolverProxy/IStaticFunctionSelectors.sol";

abstract contract ClearingReadFacetBase is ClearingRead, IStaticFunctionSelectors {
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](5);
        staticFunctionSelectors_[selectorIndex++] = this.getClearedAmountFor.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getClearedAmountForByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getClearingCountForByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getClearingsIdForByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getClearingThirdParty.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IClearingRead).interfaceId;
    }
}
