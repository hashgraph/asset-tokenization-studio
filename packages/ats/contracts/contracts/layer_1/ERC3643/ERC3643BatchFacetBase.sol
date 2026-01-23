// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC3643Batch } from "../interfaces/ERC3643/IERC3643Batch.sol";
import { IStaticFunctionSelectors } from "../../interfaces/resolver/resolverProxy/IStaticFunctionSelectors.sol";
import { ERC3643Batch } from "./ERC3643Batch.sol";

abstract contract ERC3643BatchFacetBase is ERC3643Batch, IStaticFunctionSelectors {
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        staticFunctionSelectors_ = new bytes4[](4);
        uint256 selectorsIndex;

        staticFunctionSelectors_[selectorsIndex++] = this.batchTransfer.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.batchForcedTransfer.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.batchMint.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.batchBurn.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IERC3643Batch).interfaceId;
    }
}
