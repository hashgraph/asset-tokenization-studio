// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC1644 } from "./IERC1644.sol";
import { ERC1644 } from "./ERC1644.sol";
import { IStaticFunctionSelectors } from "../../../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _ERC1644_RESOLVER_KEY } from "../../../../constants/resolverKeys.sol";

contract ERC1644Facet is ERC1644, IStaticFunctionSelectors {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _ERC1644_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](5);
        staticFunctionSelectors_[selectorIndex++] = this.initialize_ERC1644.selector;
        staticFunctionSelectors_[selectorIndex++] = this.isControllable.selector;
        staticFunctionSelectors_[selectorIndex++] = this.controllerTransfer.selector;
        staticFunctionSelectors_[selectorIndex++] = this.controllerRedeem.selector;
        staticFunctionSelectors_[selectorIndex++] = this.finalizeControllable.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IERC1644).interfaceId;
    }
}
