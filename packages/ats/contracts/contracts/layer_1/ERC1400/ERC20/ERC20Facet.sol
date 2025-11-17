// SPDX-License-Identifier: Apache-2.0
// Contract copy-pasted form OZ and extended
pragma solidity >=0.8.0 <0.9.0;

import { IERC20 } from "../../interfaces/ERC1400/IERC20.sol";
import { IStaticFunctionSelectors } from "../../../interfaces/resolver/resolverProxy/IStaticFunctionSelectors.sol";
import { _ERC20_RESOLVER_KEY } from "../../constants/resolverKeys.sol";
import { ERC20 } from "./ERC20.sol";

contract ERC20Facet is ERC20, IStaticFunctionSelectors {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _ERC20_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        staticFunctionSelectors_ = new bytes4[](12);
        uint256 selectorsIndex;
        staticFunctionSelectors_[selectorsIndex++] = this.initialize_ERC20.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.approve.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.transfer.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.transferFrom.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.increaseAllowance.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.decreaseAllowance.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.allowance.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.getERC20Metadata.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.name.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.symbol.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.decimals.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.decimalsAt.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IERC20).interfaceId;
    }
}
