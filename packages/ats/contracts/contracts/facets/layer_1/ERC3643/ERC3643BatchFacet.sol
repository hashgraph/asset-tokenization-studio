// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC3643Batch } from "./IERC3643Batch.sol";
import { ERC3643Batch } from "./ERC3643Batch.sol";
import { IStaticFunctionSelectors } from "../../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _ERC3643_BATCH_RESOLVER_KEY } from "../../../constants/resolverKeys.sol";

contract ERC3643BatchFacet is ERC3643Batch, IStaticFunctionSelectors {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _ERC3643_BATCH_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex = 3;
        staticFunctionSelectors_ = new bytes4[](selectorIndex);
        unchecked {
            staticFunctionSelectors_[--selectorIndex] = this.batchBurn.selector;
            staticFunctionSelectors_[--selectorIndex] = this.batchForcedTransfer.selector;
            staticFunctionSelectors_[--selectorIndex] = this.batchTransfer.selector;
        }
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        uint256 selectorIndex = 1;
        staticInterfaceIds_ = new bytes4[](selectorIndex);
        unchecked {
            staticInterfaceIds_[--selectorIndex] = type(IERC3643Batch).interfaceId;
        }
    }
}
