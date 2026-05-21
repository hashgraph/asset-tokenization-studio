// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IKpis } from "./IKpis.sol";
import { Kpis } from "./Kpis.sol";
import { IStaticFunctionSelectors } from "../../../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../../../infrastructure/proxy/Bytes4Builder.sol";
import { _KPIS_LATEST_KPI_LINKED_RATE_RESOLVER_KEY } from "../../../../constants/resolverKeys.sol";

contract KpisKpiLinkedRateFacet is Kpis, IStaticFunctionSelectors {
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _KPIS_LATEST_KPI_LINKED_RATE_RESOLVER_KEY;
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
