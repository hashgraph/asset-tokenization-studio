// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IStaticFunctionSelectors } from "../../../interfaces/resolver/resolverProxy/IStaticFunctionSelectors.sol";
import { IERC1410Read } from "../../interfaces/ERC1400/IERC1410Read.sol";
import { ERC1410Read } from "./ERC1410Read.sol";

abstract contract ERC1410ReadFacetBase is IStaticFunctionSelectors, ERC1410Read {
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        staticFunctionSelectors_ = new bytes4[](11);
        uint256 selectorIndex = 0;
        // Balance and supply functions
        staticFunctionSelectors_[selectorIndex++] = this.balanceOf.selector;
        staticFunctionSelectors_[selectorIndex++] = this.balanceOfAt.selector;
        staticFunctionSelectors_[selectorIndex++] = this.balanceOfByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.totalSupply.selector;
        staticFunctionSelectors_[selectorIndex++] = this.totalSupplyByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.partitionsOf.selector;
        // Configuration functions
        staticFunctionSelectors_[selectorIndex++] = this.isMultiPartition.selector;
        // Operator functions
        staticFunctionSelectors_[selectorIndex++] = this.isOperator.selector;
        staticFunctionSelectors_[selectorIndex++] = this.isOperatorForPartition.selector;
        // Can transfer/redeem functions
        staticFunctionSelectors_[selectorIndex++] = this.canTransferByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.canRedeemByPartition.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        staticInterfaceIds_[0] = type(IERC1410Read).interfaceId;
    }
}
