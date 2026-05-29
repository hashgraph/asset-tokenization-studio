// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IKpis, RESOLVER_KEY_KPIS_LATEST_KPI_LINKED_RATE } from "./IKpis.sol";
import { Kpis } from "./Kpis.sol";
import { IStaticFunctionSelectors } from "../../../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../../../infrastructure/proxy/Bytes4Builder.sol";
contract KpisKpiLinkedRateFacet is Kpis, IStaticFunctionSelectors {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_KPIS_LATEST_KPI_LINKED_RATE;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return
            Bytes4Builder.build(
                this.initializeKpis.selector,
                this.addKpiData.selector,
                this.getLatestKpiData.selector,
                this.getMinDate.selector,
                this.isCheckPointDate.selector
            );
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IKpis).interfaceId);
    }
}
