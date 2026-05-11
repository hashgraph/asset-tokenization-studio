// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;
import { IKpiLinkedRate } from "./IKpiLinkedRate.sol";
import { _KPI_LINKED_RATE_RESOLVER_KEY } from "../../../../constants/resolverKeys.sol";
import { IStaticFunctionSelectors } from "../../../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { KpiLinkedRate } from "./KpiLinkedRate.sol";

contract KpiLinkedRateFacet is KpiLinkedRate, IStaticFunctionSelectors {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _KPI_LINKED_RATE_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex = 5;
        staticFunctionSelectors_ = new bytes4[](selectorIndex);
        unchecked {
            staticFunctionSelectors_[--selectorIndex] = this.initializeKpiLinkedRate.selector;
            staticFunctionSelectors_[--selectorIndex] = this.setKpiLinkedRateInterestRate.selector;
            staticFunctionSelectors_[--selectorIndex] = this.setKpiLinkedRateImpactData.selector;
            staticFunctionSelectors_[--selectorIndex] = this.getKpiLinkedRateInterestRate.selector;
            staticFunctionSelectors_[--selectorIndex] = this.getKpiLinkedRateImpactData.selector;
        }
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        uint256 selectorIndex = 1;
        staticInterfaceIds_ = new bytes4[](selectorIndex);
        unchecked {
            staticInterfaceIds_[--selectorIndex] = type(IKpiLinkedRate).interfaceId;
        }
    }
}
