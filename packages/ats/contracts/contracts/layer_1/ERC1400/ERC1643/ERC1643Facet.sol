// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC1643 } from "../../interfaces/ERC1400/IERC1643.sol";
import { IStaticFunctionSelectors } from "../../../interfaces/resolver/resolverProxy/IStaticFunctionSelectors.sol";
import { _ERC1643_RESOLVER_KEY } from "../../constants/resolverKeys.sol";
import { ERC1643 } from "./ERC1643.sol";

contract ERC1643Facet is ERC1643, IStaticFunctionSelectors {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _ERC1643_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        staticFunctionSelectors_ = new bytes4[](4);
        uint256 selectorsIndex;
        staticFunctionSelectors_[selectorsIndex++] = this.getDocument.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.setDocument.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.removeDocument.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.getAllDocuments.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IERC1643).interfaceId;
    }
}
