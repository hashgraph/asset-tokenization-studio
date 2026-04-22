// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC1410Read } from "./IERC1410Read.sol";
import { ERC1410Read } from "./ERC1410Read.sol";
import { IStaticFunctionSelectors } from "../../../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _ERC1410_READ_RESOLVER_KEY } from "../../../../constants/resolverKeys.sol";

contract ERC1410ReadFacet is ERC1410Read, IStaticFunctionSelectors {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _ERC1410_READ_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](9);
        staticFunctionSelectors_[selectorIndex++] = this.balanceOfAt.selector;
        staticFunctionSelectors_[selectorIndex++] = this.balanceOfByPartition.selector;
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
