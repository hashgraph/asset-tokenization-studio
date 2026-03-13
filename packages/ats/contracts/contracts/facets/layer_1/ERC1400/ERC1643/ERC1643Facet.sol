// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC1643 } from "./IERC1643.sol";
import { ERC1643 } from "./ERC1643.sol";
import { IStaticFunctionSelectors } from "../../../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _ERC1643_RESOLVER_KEY } from "../../../../constants/resolverKeys.sol";

contract ERC1643Facet is ERC1643, IStaticFunctionSelectors {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _ERC1643_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](4);
        staticFunctionSelectors_[selectorIndex++] = this.getDocument.selector;
        staticFunctionSelectors_[selectorIndex++] = this.setDocument.selector;
        staticFunctionSelectors_[selectorIndex++] = this.removeDocument.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getAllDocuments.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IERC1643).interfaceId;
    }
}
