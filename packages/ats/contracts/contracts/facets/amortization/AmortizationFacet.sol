// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IAmortization, RESOLVER_KEY_AMORTIZATION } from "./IAmortization.sol";
import { Amortization } from "./Amortization.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";

contract AmortizationFacet is Amortization, IStaticFunctionSelectors {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_AMORTIZATION;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex = 17;
        staticFunctionSelectors_ = new bytes4[](selectorIndex);
        unchecked {
            staticFunctionSelectors_[--selectorIndex] = this.getTotalHoldByAmortizationId.selector;
            staticFunctionSelectors_[--selectorIndex] = this.getTotalActiveAmortizationIds.selector;
            staticFunctionSelectors_[--selectorIndex] = this.getActiveAmortizationIds.selector;
            staticFunctionSelectors_[--selectorIndex] = this.getTotalAmortizationActiveHolders.selector;
            staticFunctionSelectors_[--selectorIndex] = this.getAmortizationActiveHolders.selector;
            staticFunctionSelectors_[--selectorIndex] = this.releaseAmortizationHold.selector;
            staticFunctionSelectors_[--selectorIndex] = this.setAmortizationHold.selector;
            staticFunctionSelectors_[--selectorIndex] = this.getTotalAmortizationHolders.selector;
            staticFunctionSelectors_[--selectorIndex] = this.getAmortizationHolders.selector;
            staticFunctionSelectors_[--selectorIndex] = this.getAmortizationsCount.selector;
            staticFunctionSelectors_[--selectorIndex] = this.getAmortizationsFor.selector;
            staticFunctionSelectors_[--selectorIndex] = this.getAmortizationFor.selector;
            staticFunctionSelectors_[--selectorIndex] = this.getAmortization.selector;
            staticFunctionSelectors_[--selectorIndex] = this.forceCancelAmortization.selector;
            staticFunctionSelectors_[--selectorIndex] = this.cancelAmortization.selector;
            staticFunctionSelectors_[--selectorIndex] = this.setAmortization.selector;
            staticFunctionSelectors_[--selectorIndex] = this.initializeAmortization.selector;
        }
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        staticInterfaceIds_[0] = type(IAmortization).interfaceId;
    }
}
