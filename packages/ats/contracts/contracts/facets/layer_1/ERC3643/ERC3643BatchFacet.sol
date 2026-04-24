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
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](3);
        staticFunctionSelectors_[selectorIndex++] = this.batchTransfer.selector;
        staticFunctionSelectors_[selectorIndex++] = this.batchMint.selector;
        staticFunctionSelectors_[selectorIndex++] = this.batchBurn.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        staticInterfaceIds_[0] = type(IERC3643Batch).interfaceId;
    }
}
