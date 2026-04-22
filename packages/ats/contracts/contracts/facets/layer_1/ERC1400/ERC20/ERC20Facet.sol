// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IERC20 } from "./IERC20.sol";
import { ERC20 } from "./ERC20.sol";
import { IStaticFunctionSelectors } from "../../../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _ERC20_RESOLVER_KEY } from "../../../../constants/resolverKeys.sol";

contract ERC20Facet is ERC20, IStaticFunctionSelectors {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _ERC20_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex = 7;
        staticFunctionSelectors_ = new bytes4[](selectorIndex);
        unchecked {
            staticFunctionSelectors_[--selectorIndex] = this.allowance.selector;
            staticFunctionSelectors_[--selectorIndex] = this.decreaseAllowance.selector;
            staticFunctionSelectors_[--selectorIndex] = this.increaseAllowance.selector;
            staticFunctionSelectors_[--selectorIndex] = this.transferFrom.selector;
            staticFunctionSelectors_[--selectorIndex] = this.transfer.selector;
            staticFunctionSelectors_[--selectorIndex] = this.approve.selector;
            staticFunctionSelectors_[--selectorIndex] = this.initialize_ERC20.selector;
        }
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IERC20).interfaceId;
    }
}
