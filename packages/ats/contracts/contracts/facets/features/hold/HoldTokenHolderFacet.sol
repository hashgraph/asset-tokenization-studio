// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { HoldTokenHolder } from "./HoldTokenHolder.sol";
import { IStaticFunctionSelectors } from "../../../infrastructure/interfaces/IStaticFunctionSelectors.sol";
import { IHoldTokenHolder } from "../interfaces/hold/IHoldTokenHolder.sol";
import { _HOLD_TOKEN_HOLDER_RESOLVER_KEY } from "../../../constants/resolverKeys/features.sol";

contract HoldTokenHolderFacet is HoldTokenHolder, IStaticFunctionSelectors {
    function getStaticResolverKey() external pure returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _HOLD_TOKEN_HOLDER_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](5);
        staticFunctionSelectors_[selectorIndex++] = this.createHoldByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.createHoldFromByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.executeHoldByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.releaseHoldByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.reclaimHoldByPartition.selector;
    }

    function getStaticInterfaceIds() external pure returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IHoldTokenHolder).interfaceId;
    }
}
