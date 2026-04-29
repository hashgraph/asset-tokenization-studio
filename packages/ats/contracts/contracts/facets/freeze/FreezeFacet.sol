// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IFreeze } from "./IFreeze.sol";
import { Freeze } from "./Freeze.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _FREEZE_RESOLVER_KEY } from "../../constants/resolverKeys.sol";

contract FreezeFacet is Freeze, IStaticFunctionSelectors {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _FREEZE_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex = 4;
        staticFunctionSelectors_ = new bytes4[](selectorIndex);
        unchecked {
            staticFunctionSelectors_[--selectorIndex] = this.getFrozenTokens.selector;
            staticFunctionSelectors_[--selectorIndex] = this.setAddressFrozen.selector;
            staticFunctionSelectors_[--selectorIndex] = this.unfreezePartialTokens.selector;
            staticFunctionSelectors_[--selectorIndex] = this.freezePartialTokens.selector;
        }
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        uint256 selectorIndex = 1;
        staticInterfaceIds_ = new bytes4[](selectorIndex);
        unchecked {
            staticInterfaceIds_[--selectorIndex] = type(IFreeze).interfaceId;
        }
    }
}
