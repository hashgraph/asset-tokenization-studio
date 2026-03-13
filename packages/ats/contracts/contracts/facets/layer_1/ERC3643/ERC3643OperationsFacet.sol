// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC3643Operations } from "./IERC3643Operations.sol";
import { ERC3643Operations } from "./ERC3643Operations.sol";
import { IStaticFunctionSelectors } from "../../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _ERC3643_OPERATIONS_RESOLVER_KEY } from "../../../constants/resolverKeys.sol";

contract ERC3643OperationsFacet is ERC3643Operations, IStaticFunctionSelectors {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _ERC3643_OPERATIONS_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](3);
        staticFunctionSelectors_[selectorIndex++] = this.burn.selector;
        staticFunctionSelectors_[selectorIndex++] = this.mint.selector;
        staticFunctionSelectors_[selectorIndex++] = this.forcedTransfer.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        staticInterfaceIds_[0] = type(IERC3643Operations).interfaceId;
    }
}
