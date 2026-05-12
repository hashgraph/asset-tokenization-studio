// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;
import { ISustainabilityPerformanceTargetRate } from "./ISustainabilityPerformanceTargetRate.sol";
import { _SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY } from "../../../../constants/resolverKeys.sol";
import { IStaticFunctionSelectors } from "../../../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../../../infrastructure/proxy/Bytes4Builder.sol";
import { SustainabilityPerformanceTargetRate } from "./SustainabilityPerformanceTargetRate.sol";

contract SustainabilityPerformanceTargetRateFacet is SustainabilityPerformanceTargetRate, IStaticFunctionSelectors {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _SUSTAINABILITY_PERFORMANCE_TARGET_RATE_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return
            Bytes4Builder.build(
                this.initialize_SustainabilityPerformanceTargetRate.selector,
                this.setInterestRate.selector,
                this.setImpactData.selector,
                this.getInterestRate.selector,
                this.getImpactDataFor.selector
            );
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(ISustainabilityPerformanceTargetRate).interfaceId);
    }
}
