// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IClearingRedeem } from "../interfaces/clearing/IClearingRedeem.sol";
import { ClearingRedeem } from "./ClearingRedeem.sol";
import { IStaticFunctionSelectors } from "../../interfaces/resolver/resolverProxy/IStaticFunctionSelectors.sol";

abstract contract ClearingRedeemFacetBase is ClearingRedeem, IStaticFunctionSelectors {
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](5);
        staticFunctionSelectors_[selectorIndex++] = this.clearingRedeemByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.clearingRedeemFromByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.operatorClearingRedeemByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.protectedClearingRedeemByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getClearingRedeemForByPartition.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IClearingRedeem).interfaceId;
    }
}
