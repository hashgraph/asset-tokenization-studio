// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IHoldRead } from "./IHoldRead.sol";
import { HoldRead } from "./HoldRead.sol";
import { IStaticFunctionSelectors } from "../../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { _HOLD_READ_RESOLVER_KEY } from "../../../constants/resolverKeys.sol";

contract HoldReadFacet is HoldRead, IStaticFunctionSelectors {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _HOLD_READ_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](4);
        staticFunctionSelectors_[selectorIndex++] = this.getHeldAmountForByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getHoldCountForByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getHoldsIdForByPartition.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getHoldForByPartition.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        staticInterfaceIds_[0] = type(IHoldRead).interfaceId;
    }
}
