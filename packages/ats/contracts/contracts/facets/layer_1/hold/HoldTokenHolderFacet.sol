// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IHoldTokenHolder } from "./IHoldTokenHolder.sol";
import { HoldTokenHolder } from "./HoldTokenHolder.sol";
import { IStaticFunctionSelectors } from "../../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _HOLD_TOKEN_HOLDER_RESOLVER_KEY } from "../../../constants/resolverKeys.sol";

contract HoldTokenHolderFacet is HoldTokenHolder, IStaticFunctionSelectors {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _HOLD_TOKEN_HOLDER_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](5);
        staticFunctionSelectors_[selectorIndex++] = this.createHoldByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.createHoldFromByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.executeHoldByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.releaseHoldByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.reclaimHoldByPartition.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        staticInterfaceIds_[0] = type(IHoldTokenHolder).interfaceId;
    }
}
