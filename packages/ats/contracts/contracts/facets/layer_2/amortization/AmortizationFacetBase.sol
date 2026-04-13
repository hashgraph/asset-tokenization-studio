// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IStaticFunctionSelectors } from "../../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { IAmortization } from "./IAmortization.sol";
import { Amortization } from "./Amortization.sol";

abstract contract AmortizationFacetBase is Amortization, IStaticFunctionSelectors {
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        staticFunctionSelectors_ = new bytes4[](15);
        uint256 selectorIndex;
        staticFunctionSelectors_[selectorIndex++] = this.setAmortization.selector;
        staticFunctionSelectors_[selectorIndex++] = this.cancelAmortization.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getAmortization.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getAmortizationFor.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getAmortizationsFor.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getAmortizationsCount.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getAmortizationHolders.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getTotalAmortizationHolders.selector;
        staticFunctionSelectors_[selectorIndex++] = this.setAmortizationHold.selector;
        staticFunctionSelectors_[selectorIndex++] = this.releaseAmortizationHold.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getAmortizationActiveHolders.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getTotalAmortizationActiveHolders.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getActiveAmortizationIds.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getTotalActiveAmortizationIds.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getTotalHoldByAmortizationId.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        staticInterfaceIds_[0] = type(IAmortization).interfaceId;
    }
}
