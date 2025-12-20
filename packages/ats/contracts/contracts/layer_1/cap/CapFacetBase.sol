// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ICap } from "../interfaces/cap/ICap.sol";
import { Cap } from "./Cap.sol";
import { IStaticFunctionSelectors } from "../../interfaces/resolver/resolverProxy/IStaticFunctionSelectors.sol";

abstract contract CapFacetBase is Cap, IStaticFunctionSelectors {
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](5);
        staticFunctionSelectors_[selectorIndex++] = this.initialize_Cap.selector;
        staticFunctionSelectors_[selectorIndex++] = this.setMaxSupply.selector;
        staticFunctionSelectors_[selectorIndex++] = this.setMaxSupplyByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getMaxSupply.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getMaxSupplyByPartition.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(ICap).interfaceId;
    }
}
