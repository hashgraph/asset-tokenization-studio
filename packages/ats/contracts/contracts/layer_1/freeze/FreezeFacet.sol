// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;
import { _FREEZE_RESOLVER_KEY } from "../constants/resolverKeys.sol";
import { IStaticFunctionSelectors } from "../../interfaces/resolver/resolverProxy/IStaticFunctionSelectors.sol";
import { IFreeze } from "../interfaces/freeze/IFreeze.sol";
import { Freeze } from "./Freeze.sol";

contract FreezeFacet is Freeze, IStaticFunctionSelectors {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _FREEZE_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        staticFunctionSelectors_ = new bytes4[](7);
        uint256 selectorsIndex;
        staticFunctionSelectors_[selectorsIndex++] = this.freezePartialTokens.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.unfreezePartialTokens.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.getFrozenTokens.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.setAddressFrozen.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.batchSetAddressFrozen.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.batchFreezePartialTokens.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.batchUnfreezePartialTokens.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IFreeze).interfaceId;
    }
}
