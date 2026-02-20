// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ERC1410Read } from "./ERC1410Read.sol";
import { IStaticFunctionSelectors } from "../../../../infrastructure/interfaces/IStaticFunctionSelectors.sol";
import { IERC1410Read } from "../../interfaces/ERC1400/IERC1410Read.sol";
import { _ERC1410_READ_RESOLVER_KEY } from "../../../../constants/resolverKeys/features.sol";

contract ERC1410ReadFacet is ERC1410Read, IStaticFunctionSelectors {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _ERC1410_READ_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        staticFunctionSelectors_ = new bytes4[](11);
        uint256 selectorIndex = 0;
        staticFunctionSelectors_[selectorIndex++] = this.balanceOf.selector;
        staticFunctionSelectors_[selectorIndex++] = this.balanceOfAt.selector;
        staticFunctionSelectors_[selectorIndex++] = this.balanceOfByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.totalSupply.selector;
        staticFunctionSelectors_[selectorIndex++] = this.totalSupplyByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.partitionsOf.selector;
        staticFunctionSelectors_[selectorIndex++] = this.isMultiPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.isOperator.selector;
        staticFunctionSelectors_[selectorIndex++] = this.isOperatorForPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.canTransferByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.canRedeemByPartition.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        staticInterfaceIds_[0] = type(IERC1410Read).interfaceId;
    }
}
