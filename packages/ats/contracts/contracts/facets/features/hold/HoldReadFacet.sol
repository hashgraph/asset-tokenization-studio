// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { HoldRead } from "./HoldRead.sol";
import { IStaticFunctionSelectors } from "../../../infrastructure/interfaces/IStaticFunctionSelectors.sol";
import { IHoldRead } from "../interfaces/hold/IHoldRead.sol";
import { _HOLD_READ_RESOLVER_KEY } from "../../../constants/resolverKeys/features.sol";

contract HoldReadFacet is HoldRead, IStaticFunctionSelectors {
    function getStaticResolverKey() external pure returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _HOLD_READ_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](6);
        staticFunctionSelectors_[selectorIndex++] = this.getHeldAmountFor.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getHeldAmountForByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getHoldCountForByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getHoldsIdForByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getHoldForByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getHoldThirdParty.selector;
    }

    function getStaticInterfaceIds() external pure returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IHoldRead).interfaceId;
    }
}
