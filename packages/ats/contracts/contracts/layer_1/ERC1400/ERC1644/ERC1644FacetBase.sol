// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC1644 } from "../../interfaces/ERC1400/IERC1644.sol";
import { IStaticFunctionSelectors } from "../../../interfaces/resolver/resolverProxy/IStaticFunctionSelectors.sol";
import { ERC1644 } from "./ERC1644.sol";

abstract contract ERC1644FacetBase is ERC1644, IStaticFunctionSelectors {
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        staticFunctionSelectors_ = new bytes4[](5);
        uint256 selectorsIndex;
        staticFunctionSelectors_[selectorsIndex++] = this.initialize_ERC1644.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.isControllable.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.controllerTransfer.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.controllerRedeem.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.finalizeControllable.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IERC1644).interfaceId;
    }
}
