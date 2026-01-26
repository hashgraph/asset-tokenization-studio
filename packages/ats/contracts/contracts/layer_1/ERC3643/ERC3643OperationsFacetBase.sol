// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC3643Operations } from "../interfaces/ERC3643/IERC3643Operations.sol";
import { IStaticFunctionSelectors } from "../../interfaces/resolver/resolverProxy/IStaticFunctionSelectors.sol";
import { ERC3643Operations } from "./ERC3643Operations.sol";

abstract contract ERC3643OperationsFacetBase is IStaticFunctionSelectors, ERC3643Operations {
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        staticFunctionSelectors_ = new bytes4[](3);
        uint256 selectorsIndex;
        staticFunctionSelectors_[selectorsIndex++] = this.burn.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.mint.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.forcedTransfer.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IERC3643Operations).interfaceId;
    }
}
