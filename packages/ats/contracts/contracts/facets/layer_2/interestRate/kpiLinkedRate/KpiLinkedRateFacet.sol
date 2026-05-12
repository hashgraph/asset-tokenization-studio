// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;
import { IKpiLinkedRate } from "./IKpiLinkedRate.sol";
import { _KPI_LINKED_RATE_RESOLVER_KEY } from "../../../../constants/resolverKeys.sol";
import { IStaticFunctionSelectors } from "../../../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../../../infrastructure/proxy/Bytes4Builder.sol";
import { KpiLinkedRate } from "./KpiLinkedRate.sol";

contract KpiLinkedRateFacet is KpiLinkedRate, IStaticFunctionSelectors {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _KPI_LINKED_RATE_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return
            Bytes4Builder.build(
                this.initialize_KpiLinkedRate.selector,
                this.setInterestRate.selector,
                this.setImpactData.selector,
                this.getInterestRate.selector,
                this.getImpactData.selector
            );
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IKpiLinkedRate).interfaceId);
    }
}
